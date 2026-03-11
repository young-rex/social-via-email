import { makePacket, useAppStore } from '../data/dataStore'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'openid email profile https://www.googleapis.com/auth/gmail.modify'

export function initTokenClient(onSuccess, onError) {
  return window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        onError(tokenResponse)
      } else {
        onSuccess(tokenResponse)
      }
    },
  })
}

export async function fetchUserInfo() {
  const { session } = useAppStore.getState()
  const accessToken = session?.oauthToken
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Failed to fetch user info')
  const data = await res.json()
  return {
    email: data.email,
    name: data.name || data.email.split('@')[0],
    imageUrl: data.picture || null,
  }
}

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me'
const REQUIRED_LABELS = ['social-via-email-inbox', 'social-via-email-data']
let dataLabelId = null

async function createLabel(name) {
  const { session } = useAppStore.getState()
  const accessToken = session?.oauthToken
  const res = await fetch(`${GMAIL_API}/labels`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error(`Failed to create label: ${name}`)
  return res.json()
}

export async function initializeLabels() {
  const { addOpLog, session } = useAppStore.getState()
  addOpLog('initializeLabels: started')
  const accessToken = session?.oauthToken

  const listRes = await fetch(`${GMAIL_API}/labels`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!listRes.ok) throw new Error('Failed to list Gmail labels')
  const { labels } = await listRes.json()

  for (const labelName of REQUIRED_LABELS) {
    const existing = labels.find((l) => l.name === labelName)
    const label = existing ?? (await createLabel(labelName, accessToken))
    if (labelName === 'social-via-email-data') dataLabelId = label.id
    if (existing) {
      addOpLog(`initializeLabels: label "${labelName}" found`)
    } else {
      addOpLog(`initializeLabels: label "${labelName}" created`)
    }
  }

  addOpLog('initializeLabels: done')

  await loadEmailToState()
  await scanIncomingEmails()
}

function extractBody(payload) {
  if (payload.body?.data) {
    return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'))
      }
    }
  }
  return null
}

export async function loadEmailToState() {
  const { session, setSession, addOpLog } = useAppStore.getState()
  addOpLog('loadEmailToState: started')
  const accessToken = session?.oauthToken

  const query = encodeURIComponent('label:social-via-email-data subject:memory-dump')
  const searchRes = await fetch(`${GMAIL_API}/messages?q=${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!searchRes.ok) throw new Error('Failed to search Gmail messages')
  const { messages } = await searchRes.json()

  if (!messages || messages.length === 0) {
    addOpLog('loadEmailToState: email "memory-dump" not found')
    addOpLog('loadEmailToState: done')

    await saveStateToEmail()

  } else {

    addOpLog('loadEmailToState: email "memory-dump" found')

    const msgRes = await fetch(`${GMAIL_API}/messages/${messages[0].id}?format=full`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!msgRes.ok) throw new Error('Failed to fetch message')
    const msg = await msgRes.json()

    const body = extractBody(msg.payload)
    const { setFriends, setChats, setTimelines, setFullPostMap } = useAppStore.getState()
    const data = JSON.parse(body)
    setFriends(data.friends)
    setChats(data.chats)
    setTimelines(data.timelines)
    setFullPostMap(new Map(data.fullPostMap))

    setSession({ ...session, isDataDirty: false })

    addOpLog('loadEmailToState: state restored')
    addOpLog('loadEmailToState: done')
  }
}

function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function saveStateToEmail() {
  const { session, setSession, friends, chats, timelines, fullPostMap, addOpLog } = useAppStore.getState()
  addOpLog('saveStateToEmail: started')
  const accessToken = session?.oauthToken

  const body = JSON.stringify({ friends, chats, timelines, fullPostMap: [...fullPostMap.entries()] })

  if (!dataLabelId) throw new Error('Label "social-via-email-data" not initialized')

  // Find existing memory-dump emails before inserting
  const query = encodeURIComponent('label:social-via-email-data subject:memory-dump')
  const searchRes = await fetch(`${GMAIL_API}/messages?q=${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!searchRes.ok) throw new Error('Failed to search for old memory-dump emails')
  const { messages: oldMessages } = await searchRes.json()

  // Build and insert new RFC 2822 message
  const userEmail = session.currentUser?.email ?? ''
  const mime = [`From: ${userEmail}`, `To: ${userEmail}`, 'Subject: memory-dump', 'Content-Type: text/plain; charset=UTF-8', '', body].join('\r\n')
  const insertRes = await fetch(`${GMAIL_API}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: toBase64Url(mime), labelIds: [dataLabelId] }),
  })
  if (!insertRes.ok) throw new Error('Failed to insert memory-dump email')
  addOpLog('saveStateToEmail: email "memory-dump" created')

  // Trash old memory-dump emails
  if (oldMessages && oldMessages.length > 0) {
    for (const msg of oldMessages) {
      await fetch(`${GMAIL_API}/messages/${msg.id}/trash`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    }
    addOpLog(`saveStateToEmail: deleted ${oldMessages.length} old "memory-dump" email(s)`)
  }

  setSession({ ...session, lastSaveAt: Date.now() })
  addOpLog('saveStateToEmail: done')
}

export async function scanIncomingEmails() {
  const { session, setSession, addOpLog } = useAppStore.getState()
  addOpLog('scanIncomingEmails: started')
  setSession({ ...session, lastScanAt: Date.now() })
  addOpLog('scanIncomingEmails: done')
}

export async function sendEmail(packet) {
  const { addOpLog } = useAppStore.getState()
  const { session } = useAppStore.getState()

  addOpLog('sendEmail: started')
  addOpLog(`sendEmail: sending to ${packet.targetEmail} for ${packet.actionCode}`)

  const mime = [
    `From: ${packet.sourceEmail}`,
    `To: ${packet.targetEmail}`,
    'Subject: Lemitar::Social-via-Email',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    JSON.stringify(packet),
  ].join('\r\n')

  const sendRes = await fetch(`${GMAIL_API}/messages/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.oauthToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: toBase64Url(mime) }),
  })
  if (!sendRes.ok) addOpLog('sendEmail: Failed to send email')

  addOpLog('sendEmail: done')
}
