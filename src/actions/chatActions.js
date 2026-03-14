import { useAppStore, makePacket, makePost } from '../data/dataStore.js'
import { sendEmail } from '../gmail/gmailUtils.js'

export const featureCode = 'chat'
const actionCodeHead = 'headpost'
const actionCodePost = 'post'
const actionCodeUnsub = 'unsubscribe'

export function uiAddHeadPost(message, selectedContacts) {
  const { session, chats, setChats, fullPostMap, setFullPostMap } = useAppStore.getState()

  const currentUser = session.currentUser
  const subscribers = [currentUser.email, ...selectedContacts.map((c) => c.email)]
  const headpost = makePost(currentUser.email, message, { subscribers })

  fullPostMap.set(headpost.uuid, headpost)
  setFullPostMap(new Map(fullPostMap))
  setChats([...chats, headpost.uuid])

  selectedContacts
    .forEach((c) => {
      const packet = makePacket(currentUser.email, c.email, featureCode, actionCodeHead, { post: headpost })
      sendEmail(packet)
    })
}

export function uiAddPost(message, headpost) {
  const { session, fullPostMap, setFullPostMap } = useAppStore.getState()
  const currentUser = session.currentUser

  const childpost = makePost(currentUser.email, message, { headPostUuid: headpost.uuid })

  headpost.childPostUuids.push(childpost.uuid)
  fullPostMap.set(childpost.uuid, childpost)
  setFullPostMap(new Map(fullPostMap))

  headpost.subscribers
    .filter((email) => email !== currentUser.email)
    .forEach((email) => {
      const packet = makePacket(currentUser.email, email, featureCode, actionCodePost, { post: childpost })
      sendEmail(packet)
    })
}

export function uiUnsubscribe(headpost) {
  const { session, chats, setChats, fullPostMap, setFullPostMap } = useAppStore.getState()
  const currentUser = session.currentUser

  const uuidsToDelete = [headpost.uuid, ...headpost.childPostUuids]
  uuidsToDelete.forEach((uuid) => fullPostMap.delete(uuid))
  setFullPostMap(new Map(fullPostMap))
  setChats(chats.filter((uuid) => uuid !== headpost.uuid))

  headpost.subscribers
    .filter((email) => email !== currentUser.email)
    .forEach((email) => {
      const packet = makePacket(currentUser.email, email, featureCode, actionCodeUnsub, { headpostuuid: headpost.uuid, unsubscriber: currentUser.email })
      sendEmail(packet)
    })
}

export function processPacket(packet) {
  const { addLog } = useAppStore.getState()
  addLog(`chatActions: processing packet from ${packet.sourceEmail} for ${packet.featureCode}/${packet.actionCode}`)

  const { chats, setChats, fullPostMap, setFullPostMap } = useAppStore.getState()

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
    setChats([...chats, post.uuid])

  } else if (packet.actionCode === actionCodePost) {

    const headpost = fullPostMap.get(post.headPostUuid)
    if (!headpost) return

    headpost.childPostUuids.push(post.uuid)
    fullPostMap.set(post.uuid, post)
    setFullPostMap(new Map(fullPostMap))

  }
}
