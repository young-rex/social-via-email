import { useAppStore } from '../data/dataStore'
import { processPacket } from '../actions/actionCenter'

const GRAPH_API = 'https://graph.microsoft.com/v1.0/me'
const dataFolderName = 'social-via-email-data'
const inboxFolderName = 'social-via-email-inbox'
const emailSubject = 'Lemitar::Social-via-Email'

export async function initializeLabels() {
  const { addLog, session, setSession } = useAppStore.getState()
  addLog('initializeLabels: started')
  try {
    const listResp = await graphFetch('initializeLabels', `${GRAPH_API}/mailFolders?$top=100`)
    const { value: folders } = await listResp.json()
    for (const folderName of [dataFolderName, inboxFolderName]) {
      const existingFolder = folders.find((f) => f.displayName === folderName)
      if (existingFolder) {
        if (folderName === dataFolderName) {
          setSession({ ...session, outlookDataFolderId: existingFolder.id })
        }
        addLog(`initializeLabels: "${folderName}" folder found`)
      } else {
        const createResp = await graphFetch('initializeLabels', `${GRAPH_API}/mailFolders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName: folderName }),
        })
        if (!createResp.ok) throw new Error(`failed to create "${folderName}" folder`)
        const newFolder = await createResp.json()
        if (folderName === dataFolderName) {
          setSession({ ...session, outlookDataFolderId: newFolder.id })
        }
        addLog(`initializeLabels: "${folderName}" folder created`)
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
    const { session: { outlookDataFolderId } } = useAppStore.getState()
    const searchResp = await graphFetch(
      'loadEmailToState',
      `${GRAPH_API}/mailFolders/${outlookDataFolderId}/messages?$filter=subject eq 'memory-dump'&$select=id&$top=1`
    )
    const { value: messages } = await searchResp.json()

    if (!messages || messages.length === 0) {
      addLog('loadEmailToState: "memory-dump" email not found')
      addLog('loadEmailToState: state reset')
    } else {
      addLog('loadEmailToState: "memory-dump" email found')

      const msgResp = await graphFetch(
        'loadEmailToState',
        `${GRAPH_API}/messages/${messages[0].id}?$select=body`
      )
      const msg = await msgResp.json()
      const jsonObj = JSON.parse(msg.body.content.replace(/\r\n|\r|\n/g, ' '))

      const { session, setSession, setContacts, setChats, setConversations, setFullPostMap } =
        useAppStore.getState()
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
  const { session, setSession, contacts, chats, conversations, fullPostMap, addLog } =
    useAppStore.getState()
  if (!session?.isDataDirty) {
    const proceed = window.confirm('No changes detected. Save anyway?')
    if (!proceed) return
  }
  addLog('saveStateToEmail: started')
  try {
    const { outlookDataFolderId } = session
    if (!outlookDataFolderId) throw new Error(`folder "${dataFolderName}" not initialized`)

    const bodyJsonStr = JSON.stringify({
      contacts,
      chats,
      conversations,
      fullPostMap: [...fullPostMap.entries()],
    })

    const { value: oldMessages } = await graphFetch(
      'saveStateToEmail',
      `${GRAPH_API}/mailFolders/${outlookDataFolderId}/messages?$filter=subject eq 'memory-dump'&$select=id`
    ).then((r) => r.json())

    await graphFetch('saveStateToEmail', `${GRAPH_API}/mailFolders/${outlookDataFolderId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'memory-dump',
        body: { contentType: 'Text', content: bodyJsonStr },
      }),
    })
    addLog('saveStateToEmail: created "memory-dump" email')

    if (oldMessages && oldMessages.length > 0) {
      for (const msg of oldMessages) {
        await graphFetch('saveStateToEmail', `${GRAPH_API}/messages/${msg.id}/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destinationId: 'deleteditems' }),
        })
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
    async function fetchAllPages(startUrl) {
      const results = []
      let nextUrl = startUrl
      do {
        const resp = await graphFetch('scanIncomingEmails', nextUrl)
        const data = await resp.json()
        results.push(...(data.value || []))
        nextUrl = data['@odata.nextLink'] || null
      } while (nextUrl)
      return results
    }

    const [inbox, junk] = await Promise.all([
      fetchAllPages(`${GRAPH_API}/messages?$search="subject:${emailSubject}"&$select=id,receivedDateTime&$top=50`),
      fetchAllPages(`${GRAPH_API}/mailFolders/junkemail/messages?$search="subject:${emailSubject}"&$select=id,receivedDateTime&$top=50`),
    ])
    const seen = new Set()
    const messages = [...inbox, ...junk].filter(({ id }) => seen.has(id) ? false : seen.add(id))

    if (messages.length === 0) {
      addLog('scanIncomingEmails: incoming emails not found')
    } else {
      addLog(`scanIncomingEmails: found ${messages.length} email(s)`)

      const fetched = []
      for (const { id } of messages) {
        const msgResp = await graphFetch(
          'scanIncomingEmails',
          `${GRAPH_API}/messages/${id}?$select=body,receivedDateTime`
        )
        fetched.push(await msgResp.json())
      }
      fetched.sort((a, b) => new Date(a.receivedDateTime) - new Date(b.receivedDateTime))

      for (const msg of fetched) {
        const bodyJsonStr = msg.body.content.replace(/\r\n|\r|\n/g, ' ')

        const packet = JSON.parse(bodyJsonStr)
        processPacket(packet)

        await graphFetch('scanIncomingEmails', `${GRAPH_API}/messages/${msg.id}/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destinationId: 'deleteditems' }),
        })
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
    const sentMessages = []
    let nextUrl = `${GRAPH_API}/mailFolders/sentitems/messages?$search="subject:${emailSubject}"&$select=id&$top=50`
    do {
      const resp = await graphFetch('deleteSentEmails', nextUrl)
      const data = await resp.json()
      sentMessages.push(...(data.value || []))
      nextUrl = data['@odata.nextLink'] || null
    } while (nextUrl)

    if (sentMessages.length === 0) {
      addLog('deleteSentEmails: no sent emails found')
    } else {
      for (const msg of sentMessages) {
        await graphFetch('deleteSentEmails', `${GRAPH_API}/messages/${msg.id}/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destinationId: 'deleteditems' }),
        })
      }
      addLog(`deleteSentEmails: trashed ${sentMessages.length} sent email(s)`)
    }
  } catch (e) {
    addLog(`deleteSentEmails: error — ${e.message}`)
  } finally {
    addLog('deleteSentEmails: done')
  }
}

export async function sendEmail(packet) {
  const { addLog, session } = useAppStore.getState()
  addLog('sendEmail: started')
  addLog(`sendEmail: sending to ${packet.targetEmail} for ${packet.featureCode}/${packet.actionCode}`)
  try {
    const sendResp = await graphFetch('sendEmail', `${GRAPH_API}/sendMail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          subject: emailSubject,
          body: { contentType: 'Text', content: JSON.stringify(packet) },
          toRecipients: [{ emailAddress: { address: packet.targetEmail } }],
          from: { emailAddress: { address: session.currentUser.email } },
        },
        saveToSentItems: true,
      }),
    })

    if (!sendResp.ok) addLog('sendEmail: failed to send email')
  } catch (e) {
    addLog(`sendEmail: error — ${e.message}`)
  } finally {
    addLog('sendEmail: done')
  }
}

async function graphFetch(funcName, url, overrides = {}) {
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
    addLog(`${funcName}: Outlook access token has expired. ****** Sign out ******`)
  } else if (!resp.ok && resp.status !== 204) {
    addLog(`${funcName}: Unexpected HTTP status code ${resp.status}`)
  }

  return resp
}
