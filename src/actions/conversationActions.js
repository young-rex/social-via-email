import { useAppStore, makePacket, makePost } from '../data/dataStore.js'
import { sendEmail } from '../email/emailUtils'

export const featureCode = 'conversation'
const actionCodeHead = 'headpost'
const actionCodePost = 'post'
const actionCodeUnsub = 'unsubscribe'

export function uiAddHeadPost(message) {
  const { session, contacts, conversations, setConversations, fullPostMap, setFullPostMap } = useAppStore.getState()

  const currentUser = session.currentUser
  const subscribers = [currentUser.email, ...contacts.map((f) => f.email)]
  const headpost = makePost(currentUser.email, message, { subscribers })

  fullPostMap.set(headpost.uuid, headpost)
  setFullPostMap(new Map(fullPostMap))
  setConversations([...conversations, headpost.uuid])

  contacts.forEach((c) => {
    const packet = makePacket(currentUser.email, c.email, featureCode, actionCodeHead, { post: headpost })
    sendEmail(packet)
  })
}

export function uiAddPost(message, headpost, parentPost) {
  const { session, fullPostMap, setFullPostMap } = useAppStore.getState()
  const currentUser = session.currentUser

  const childpost = makePost(currentUser.email, message, {
    subscribers: [],
    headPostUuid: headpost.uuid,
    parentPostUuid: parentPost.uuid,
  })

  parentPost.childPostUuids.push(childpost.uuid)
  fullPostMap.set(childpost.uuid, childpost)
  setFullPostMap(new Map(fullPostMap))

  headpost.subscribers
    .filter((email) => email !== currentUser.email)
    .forEach((email) => {
      const packet = makePacket(currentUser.email, email, featureCode, actionCodePost, { post: childpost })
      sendEmail(packet)
    })
}

function collectAllUuids(post, fullPostMap) {
  const uuids = [post.uuid]
  for (const childUuid of post.childPostUuids) {
    const child = fullPostMap.get(childUuid)
    if (child) uuids.push(...collectAllUuids(child, fullPostMap))
  }
  return uuids
}

export function uiUnsubscribe(headpost) {
  const { session, conversations, setConversations, fullPostMap, setFullPostMap } = useAppStore.getState()
  const currentUser = session.currentUser

  const uuidsToDelete = collectAllUuids(headpost, fullPostMap)
  uuidsToDelete.forEach((uuid) => fullPostMap.delete(uuid))
  setFullPostMap(new Map(fullPostMap))
  setConversations(conversations.filter((uuid) => uuid !== headpost.uuid))

  headpost.subscribers
    .filter((email) => email !== currentUser.email)
    .forEach((email) => {
      const packet = makePacket(currentUser.email, email, featureCode, actionCodeUnsub, { headpostuuid: headpost.uuid, unsubscriber: currentUser.email })
      sendEmail(packet)
    })
}

export function processPacket(packet) {
  const { addLog } = useAppStore.getState()
  addLog(`conversationActions: processing packet from ${packet.sourceEmail} for ${packet.featureCode}/${packet.actionCode}`)

  const { conversations, setConversations, fullPostMap, setFullPostMap } = useAppStore.getState()

  if (packet.actionCode === actionCodeUnsub) {

    const headpost = fullPostMap.get(packet.headpostuuid)
    if (!headpost) return

    headpost.subscribers = headpost.subscribers.filter((email) => email !== packet.unsubscriber)
    setFullPostMap(new Map(fullPostMap))
    return

  }

  const post = packet.post
  if (fullPostMap.has(post.uuid)) return

  if (packet.actionCode === actionCodeHead) {

    fullPostMap.set(post.uuid, post)
    setFullPostMap(new Map(fullPostMap))
    setConversations([...conversations, post.uuid])

  } else if (packet.actionCode === actionCodePost) {

    const parentPost = fullPostMap.get(post.parentPostUuid)
    if (!parentPost) return

    parentPost.childPostUuids.push(post.uuid)
    fullPostMap.set(post.uuid, post)
    setFullPostMap(new Map(fullPostMap))

  }
}
