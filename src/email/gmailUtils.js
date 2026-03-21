import { useAppStore } from '../data/dataStore'
import { processEnvelope } from '../features/featureCenter'

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me'
const dataLabel = 'social-via-email-data'
const inboxLabel = 'social-via-email-inbox'
const aiLabel = 'social-via-email-ai'
const emailSubject = 'Lemitar::Social-via-Email'

export async function initializeLabels() {
  const { addLog, session, setSession } = useAppStore.getState()
  addLog('initializeLabels: started')
  try {
    const listResp = await gmailFetch('initializeLabels', `${GMAIL_API}/labels`)
    const { labels } = await listResp.json()
    for (const labelName of [dataLabel, inboxLabel, aiLabel]) {
      const existingLabel = labels.find((l) => l.name === labelName)
      if (existingLabel) {
        if (labelName === dataLabel) {
          setSession({ ...session, gmailDataLabelId: existingLabel.id })
        }
        addLog(`initializeLabels: "${labelName}" label found`)
      } else {
        const createResp = await gmailFetch('initializeLabels', `${GMAIL_API}/labels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: labelName }),
        })
        if (!createResp.ok) throw new Error(`failed to create "${labelName}" label`)
        const newLabel = await createResp.json()
        if (labelName === dataLabel) {
          setSession({ ...session, gmailDataLabelId: newLabel.id })
        }
        addLog(`initializeLabels: "${labelName}" label created`)
      }
    }
  } catch (e) {
    addLog(`initializeLabels: error — ${e.message}`)
  } finally {
    addLog('initializeLabels: done')
  }
}

export async function loadEmailToState() {
  const { addLog } = useAppStore.getState()
  addLog('loadEmailToState: started')
  try {
    const query = encodeURIComponent('label:social-via-email-data subject:memory-dump')
    const searchResp = await gmailFetch('loadEmailToState', `${GMAIL_API}/messages?q=${query}`)
    const { messages } = await searchResp.json()

    if (!messages || messages.length === 0) {
      addLog('loadEmailToState: "memory-dump" email not found')
      addLog('loadEmailToState: state reset')
    } else {
      addLog('loadEmailToState: "memory-dump" email found')

      const msgResp = await gmailFetch('loadEmailToState', `${GMAIL_API}/messages/${messages[0].id}?format=full`)
      const msg = await msgResp.json()
      const jsonObj = JSON.parse(extractBody(msg.payload))

      const { session, setSession, setContacts, setChats, setConversations, setFullPostMap } = useAppStore.getState()
      setContacts(jsonObj.contacts)
      setChats(jsonObj.chats)
      setConversations(jsonObj.conversations)
      setFullPostMap(new Map(jsonObj.fullPostMap))

      setSession({ ...session, isDataDirty: false })
      addLog('loadEmailToState: state restored')
    }
  } catch (e) {
    addLog(`loadEmailToState: error — ${e.message}`)
  } finally {
    addLog('loadEmailToState: done')
  }
}

export async function saveStateToEmail() {
  const { session, setSession, contacts, chats, conversations, fullPostMap, addLog } = useAppStore.getState()
  if (!session?.isDataDirty) {
    const proceed = window.confirm('No changes detected. Save anyway?')
    if (!proceed) return
  }
  addLog('saveStateToEmail: started')
  try {
    const { gmailDataLabelId } = session
    if (!gmailDataLabelId) throw new Error(`label "${dataLabel}" not initialized`)

    const bodyJsonStr = JSON.stringify({ contacts, chats, conversations, fullPostMap: [...fullPostMap.entries()] })

    const query = encodeURIComponent(`label:${dataLabel} subject:memory-dump`)
    const searchRes = await gmailFetch('saveStateToEmail', `${GMAIL_API}/messages?q=${query}`)
    const { messages: oldMessages } = await searchRes.json()

    const mime = [`From: sve@localhost`, `To: sve@localhost`, 'Subject: memory-dump', 'Content-Type: text/plain; charset=UTF-8', '', bodyJsonStr].join('\r\n')
    await gmailFetch('saveStateToEmail', `${GMAIL_API}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: toBase64Url(mime), labelIds: [gmailDataLabelId] }),
    })
    addLog('saveStateToEmail: created "memory-dump" email')

    if (oldMessages && oldMessages.length > 0) {
      for (const msg of oldMessages) {
        await gmailFetch('saveStateToEmail', `${GMAIL_API}/messages/${msg.id}/trash`, { method: 'POST' })
      }
      addLog(`saveStateToEmail: deleted ${oldMessages.length} old "memory-dump" email(s)`)
    }

    setSession({ ...session, lastSaveAt: Date.now(), isDataDirty: false })
  } catch (e) {
    addLog(`saveStateToEmail: error — ${e.message}`)
  } finally {
    addLog('saveStateToEmail: done')
  }
}

export async function scanIncomingEmails() {
  const { addLog } = useAppStore.getState()
  addLog('scanIncomingEmails: started')
  try {
    const query = encodeURIComponent(`subject:"${emailSubject}" (label:inbox OR label:${inboxLabel} OR in:spam)`)
    const searchResp = await gmailFetch('scanIncomingEmails', `${GMAIL_API}/messages?q=${query}`)
    const { messages } = await searchResp.json()

    if (!messages || messages.length === 0) {
      addLog('scanIncomingEmails: incoming emails not found')
    } else {
      addLog(`scanIncomingEmails: found ${messages.length} email(s)`)

      const fetched = []
      for (const { id } of messages) {
        const msgResp = await gmailFetch('scanIncomingEmails', `${GMAIL_API}/messages/${id}?format=full`)
        fetched.push(await msgResp.json())
      }
      fetched.sort((a, b) => Number(a.internalDate) - Number(b.internalDate))

      for (const msg of fetched) {
        const bodyJsonStr = extractBody(msg.payload)

        const envelope = JSON.parse(bodyJsonStr)
        processEnvelope(envelope)

        await gmailFetch('scanIncomingEmails', `${GMAIL_API}/messages/${msg.id}/trash`, { method: 'POST' })
        addLog('scanIncomingEmails: trashed email')
      }
    }

    const { session, setSession } = useAppStore.getState()
    setSession({ ...session, lastScanAt: Date.now() })
  } catch (e) {
    addLog(`scanIncomingEmails: error — ${e.message}`)
  } finally {
    addLog('scanIncomingEmails: done')
  }

  deleteSentEmails()
}

async function deleteSentEmails() {
  const { addLog } = useAppStore.getState()
  addLog('deleteSentEmails: started')
  try {
    const query = encodeURIComponent(`in:sent subject:"${emailSubject}"`)
    const searchResp = await gmailFetch('deleteSentEmails', `${GMAIL_API}/messages?q=${query}`)
    const { messages } = await searchResp.json()

    if (!messages || messages.length === 0) {
      addLog('deleteSentEmails: sent emails not found')
    } else {
      for (const msg of messages) {
        await gmailFetch('deleteSentEmails', `${GMAIL_API}/messages/${msg.id}/trash`, { method: 'POST' })
      }
      addLog(`deleteSentEmails: trashed ${messages.length} sent email(s)`)
    }
  } catch (e) {
    addLog(`deleteSentEmails: error — ${e.message}`)
  } finally {
    addLog('deleteSentEmails: done')
  }
}

export async function sendEmail(envelope) {
  const { addLog } = useAppStore.getState()
  const [targetEmail, targetFeature] = envelope.target.split('#')
  const [replytoEmail] = envelope.replyto.split('#')
  addLog('sendEmail: started')
  addLog(`sendEmail: sending to ${targetEmail} for ${targetFeature}/${envelope.args.action}`)
  try {
    const mime = [
      `From: ${replytoEmail}`,
      `To: ${targetEmail}`,
      `Subject: ${emailSubject}`,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      JSON.stringify(envelope),
    ].join('\r\n')

    const sendResp = await gmailFetch('sendEmail', `${GMAIL_API}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: toBase64Url(mime) }),
    })

    if (!sendResp.ok) addLog('sendEmail: failed to send email')
  } catch (e) {
    addLog(`sendEmail: error — ${e.message}`)
  } finally {
    addLog('sendEmail: done')
  }
}

async function gmailFetch(funcName, url, overrides = {}) {
  const { session, addLog } = useAppStore.getState()
  const merged = {
    ...overrides,
    headers: {
      Authorization: `Bearer ${session?.oauthToken}`,
      ...overrides.headers,
    },
  }

  const resp = await fetch(url, merged)

  if (resp.status === 401) {
    addLog(`${funcName}: Gmail access token has expired. ****** Sign out ******`)
  } else if (!resp.ok) {
    addLog(`${funcName}: Unexpected HTTP status code ${resp.status}`)
  }

  return resp
}

function extractBody(payload) {
  if (payload.body?.data) {
    return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/')).replace(/\r\n|\r|\n/g, ' ')
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/')).replace(/\r\n|\r|\n/g, ' ')
      }
    }
  }
  return null
}

function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
