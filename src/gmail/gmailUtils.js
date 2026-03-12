import { useAppStore } from '../data/dataStore'
import { processPacket } from '../actions/actionCenter'

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me'
const dataLabel = 'social-via-email-data'
const inboxLabel = 'social-via-email-inbox'
const emailSubject = 'Lemitar::Social-via-Email'

export async function initializeLabels() {
  const { addOpLog, session, setSession } = useAppStore.getState()
  addOpLog('initializeLabels: started')
  try {
    const listResp = await gmailFetch('initializeLabels', `${GMAIL_API}/labels`)
    const { labels } = await listResp.json()
    for (const labelName of [dataLabel, inboxLabel]) {
      const existingLabel = labels.find((l) => l.name === labelName)
      if (existingLabel) {
        if (labelName === dataLabel) {
          setSession({ ...session, gmailDataLabelId: existingLabel.id })
        }
        addOpLog(`initializeLabels: "${labelName}" label found`)
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
        addOpLog(`initializeLabels: "${labelName}" label created`)
      }
    }
  } catch (e) {
    addOpLog(`initializeLabels: error — ${e.message}`)
  } finally {
    addOpLog('initializeLabels: done')
  }
}

export async function loadEmailToState() {
  const { addOpLog } = useAppStore.getState()
  addOpLog('loadEmailToState: started')
  try {
    const query = encodeURIComponent('label:social-via-email-data subject:memory-dump')
    const searchResp = await gmailFetch('loadEmailToState', `${GMAIL_API}/messages?q=${query}`)
    const { messages } = await searchResp.json()

    if (!messages || messages.length === 0) {
      addOpLog('loadEmailToState: "memory-dump" email not found')
      addOpLog('loadEmailToState: state reset')
    } else {
      addOpLog('loadEmailToState: "memory-dump" email found')

      const msgResp = await gmailFetch('loadEmailToState', `${GMAIL_API}/messages/${messages[0].id}?format=full`)
      const msg = await msgResp.json()
      const jsonObj = JSON.parse(extractBody(msg.payload))

      const { session, setSession, setFriends, setChats, setTimelines, setFullPostMap } = useAppStore.getState()
      setFriends(jsonObj.friends)
      setChats(jsonObj.chats)
      setTimelines(jsonObj.timelines)
      setFullPostMap(new Map(jsonObj.fullPostMap))

      setSession({ ...session, isDataDirty: false })
      addOpLog('loadEmailToState: state restored')
    }
  } catch (e) {
    addOpLog(`loadEmailToState: error — ${e.message}`)
  } finally {
    addOpLog('loadEmailToState: done')
  }
}

export async function saveStateToEmail() {
  const { session, setSession, friends, chats, timelines, fullPostMap, addOpLog } = useAppStore.getState()
  addOpLog('saveStateToEmail: started')
  try {
    const { gmailDataLabelId } = session
    if (!gmailDataLabelId) throw new Error(`label "${dataLabel}" not initialized`)

    const bodyJsonStr = JSON.stringify({ friends, chats, timelines, fullPostMap: [...fullPostMap.entries()] })

    // Find existing memory-dump emails before inserting
    const query = encodeURIComponent(`label:${dataLabel} subject:memory-dump`)
    const searchRes = await gmailFetch('saveStateToEmail', `${GMAIL_API}/messages?q=${query}`)
    const { messages: oldMessages } = await searchRes.json()

    // Build and insert new RFC 2822 message
    const userEmail = session.currentUser?.email ?? ''
    const mime = [`From: ${userEmail}`, `To: ${userEmail}`, 'Subject: memory-dump', 'Content-Type: text/plain; charset=UTF-8', '', bodyJsonStr].join('\r\n')
    await gmailFetch('saveStateToEmail', `${GMAIL_API}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: toBase64Url(mime), labelIds: [gmailDataLabelId] }),
    })
    addOpLog('saveStateToEmail: created "memory-dump" email')

    // Trash old memory-dump emails
    if (oldMessages && oldMessages.length > 0) {
      for (const msg of oldMessages) {
        await gmailFetch('saveStateToEmail', `${GMAIL_API}/messages/${msg.id}/trash`, { method: 'POST' })
      }
      addOpLog(`saveStateToEmail: deleted ${oldMessages.length} old "memory-dump" email(s)`)
    }

    setSession({ ...session, lastSaveAt: Date.now(), isDataDirty: false })
  } catch (e) {
    addOpLog(`saveStateToEmail: error — ${e.message}`)
  } finally {
    addOpLog('saveStateToEmail: done')
  }
}

export async function scanIncomingEmails() {
  const { addOpLog } = useAppStore.getState()
  addOpLog('scanIncomingEmails: started')
  try {
    const query = encodeURIComponent(`subject:"${emailSubject}" (label:inbox OR label:${inboxLabel})`)
    const searchResp = await gmailFetch('scanIncomingEmails', `${GMAIL_API}/messages?q=${query}`)
    const { messages } = await searchResp.json()

    if (!messages || messages.length === 0) {
      addOpLog('scanIncomingEmails: incoming emails not found')
    } else {
      addOpLog(`scanIncomingEmails: found ${messages.length} email(s)`)
      for (const { id } of messages) {
        // 1/3: Read email
        const msgResp = await gmailFetch('scanIncomingEmails', `${GMAIL_API}/messages/${id}?format=full`)
        const msg = await msgResp.json()
        const bodyJsonStr = extractBody(msg.payload)

        // 2/3: Process email
        const packet = JSON.parse(bodyJsonStr)
        processPacket(packet)

        // 3/3: Trash email
        await gmailFetch('scanIncomingEmails', `${GMAIL_API}/messages/${id}/trash`, { method: 'POST' })
        addOpLog('scanIncomingEmails: trashed email')
      }
      await saveStateToEmail()
    }

    const { session, setSession } = useAppStore.getState()
    setSession({ ...session, lastScanAt: Date.now() })
  } catch (e) {
    addOpLog(`scanIncomingEmails: error — ${e.message}`)
  } finally {
    addOpLog('scanIncomingEmails: done')
  }
}

export async function sendEmail(packet) {
  const { addOpLog } = useAppStore.getState()
  addOpLog('sendEmail: started')
  addOpLog(`sendEmail: sending to ${packet.targetEmail} for ${packet.featureCode}/${packet.actionCode}`)
  try {
    const mime = [
      `From: ${packet.sourceEmail}`,
      `To: ${packet.targetEmail}`,
      `Subject: ${emailSubject}`,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      JSON.stringify(packet),
    ].join('\r\n')

    const sendResp = await gmailFetch('sendEmail', `${GMAIL_API}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: toBase64Url(mime) }),
    })

    if (!sendResp.ok) addOpLog('sendEmail: failed to send email')
  } catch (e) {
    addOpLog(`sendEmail: error — ${e.message}`)
  } finally {
    addOpLog('sendEmail: done')
  }
}

async function gmailFetch(funcName, url, overrides = {}) {
  const { session, addOpLog } = useAppStore.getState()
  const merged = {
    ...overrides,
    headers: {
      Authorization: `Bearer ${session?.oauthToken}`,
      ...overrides.headers,
    },
  }

  const resp = await fetch(url, merged)

  if (resp.status === 401) {
    addOpLog(`${funcName}: Gmail access token has expired. ****** Sign out ******`)
  } else if (!resp.ok) {
    addOpLog(`${funcName}: Unexpected HTTP status code ${resp.status}`)
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
