import { useAppStore, makePacket, makePost } from '../data/dataStore.js'
import { sendEmail } from '../gmail/gmailUtils.js'

export const featureCode = 'chat'
const actionCodeHead = 'headpost'
const actionCodePost = 'post'

/*  Packet structure for friend actions:
    {
      sourceEmail,
      targetEmail,
      appCode: "Social-via-Email",
      featureCode: "chat",
      actionCode: "headpost" / "post",
      post: Post,
    }

    {
      uuid: crypto.randomUUID(),
      timestamp: Date.now(),
      author, // email
      text,   // text content
      subscribers: [],  // emails
      headPostUuid: null,
      childPostUuids: [],
      parentPostUuid: null,
      ...overrides,
    }
*/

export function uiAddChat(message, selectedFriends) {
  const { session, chats, setChats, fullPostMap, setFullPostMap } = useAppStore.getState()

  const currentUser = session.currentUser
  const subscribers = [currentUser.email, ...selectedFriends.map((f) => f.email)]
  const headpost = makePost(currentUser.email, message, { subscribers })

  fullPostMap.set(headpost.uuid, headpost)
  setFullPostMap(new Map(fullPostMap))
  setChats([...chats, headpost.uuid])

  selectedFriends
    .forEach((f) => {
      const packet = makePacket(currentUser.email, f.email, featureCode, actionCodeHead, { post: headpost })
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

export function processPacket(packet) {
  const { addLog } = useAppStore.getState()
  addLog(`chatActions: processing packet from ${packet.sourceEmail} for ${packet.featureCode}/${packet.actionCode}`)

  const { chats, setChats, fullPostMap, setFullPostMap } = useAppStore.getState()
  const post = packet.post

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
