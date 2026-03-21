import { useAppStore, makeEnvelope, makePost } from '../data/dataStore.js'
import { sendEmail } from '../email/emailUtils'

export const feature = 'conversation'
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
    const envelope = makeEnvelope(`${c.email}#${feature}`, `${currentUser.email}#${feature}`, actionCodeHead, { post: headpost })
    sendEmail(envelope)
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
      const envelope = makeEnvelope(`${email}#${feature}`, `${currentUser.email}#${feature}`, actionCodePost, { post: childpost })
      sendEmail(envelope)
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
      const envelope = makeEnvelope(`${email}#${feature}`, `${currentUser.email}#${feature}`, actionCodeUnsub, { headpostuuid: headpost.uuid, unsubscriber: currentUser.email })
      sendEmail(envelope)
    })
}

export function processEnvelope(envelope) {
  const { addLog } = useAppStore.getState()
  const [, targetFeature] = envelope.target.split('#')
  const [replytoEmail] = envelope.replyto.split('#')
  addLog(`conversationActions: processing envelope from ${replytoEmail} for ${targetFeature}/${envelope.args.action}`)

  const { conversations, setConversations, fullPostMap, setFullPostMap } = useAppStore.getState()

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
    setConversations([...conversations, post.uuid])

  } else if (envelope.args.action === actionCodePost) {

    const parentPost = fullPostMap.get(post.parentPostUuid)
    if (!parentPost) return

    parentPost.childPostUuids.push(post.uuid)
    fullPostMap.set(post.uuid, post)
    setFullPostMap(new Map(fullPostMap))

  }
}
