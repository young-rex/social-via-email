import { useAppStore, makeEnvelope, makePost } from '../data/dataStore.js'
import { sendEmail } from '../email/emailUtils'

export const feature = 'chat'
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
      const envelope = makeEnvelope(`${c.email}#${feature}`, `${currentUser.email}#${feature}`, actionCodeHead, { post: headpost })
      sendEmail(envelope)
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
      const envelope = makeEnvelope(`${email}#${feature}`, `${currentUser.email}#${feature}`, actionCodePost, { post: childpost })
      sendEmail(envelope)
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
      const envelope = makeEnvelope(`${email}#${feature}`, `${currentUser.email}#${feature}`, actionCodeUnsub, { headpostuuid: headpost.uuid, unsubscriber: currentUser.email })
      sendEmail(envelope)
    })
}

export function processEnvelope(envelope) {
  const { addLog } = useAppStore.getState()
  const [, targetFeature] = envelope.target.split('#')
  const [replytoEmail] = envelope.replyto.split('#')
  addLog(`chatActions: processing envelope from ${replytoEmail} for ${targetFeature}/${envelope.args.action}`)

  const { chats, setChats, fullPostMap, setFullPostMap } = useAppStore.getState()

  if (envelope.args.action === actionCodeUnsub) {

    const headpost = fullPostMap.get(envelope.args.headpostuuid)
    if (!headpost) return

    headpost.subscribers = headpost.subscribers.filter((email) => email !== envelope.args.unsubscriber)
    setFullPostMap(new Map(fullPostMap))
    return

  }

  const post = envelope.args.post
  if (fullPostMap.has(post.uuid)) return

  if (envelope.args.action === actionCodeHead) {

    fullPostMap.set(post.uuid, post)
    setFullPostMap(new Map(fullPostMap))
    setChats([...chats, post.uuid])

  } else if (envelope.args.action === actionCodePost) {

    const headpost = fullPostMap.get(post.headPostUuid)
    if (!headpost) return

    headpost.childPostUuids.push(post.uuid)
    fullPostMap.set(post.uuid, post)
    setFullPostMap(new Map(fullPostMap))

  }
}
