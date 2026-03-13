import { useAppStore, makePacket, makePost } from '../data/dataStore.js'
import { sendEmail } from '../gmail/gmailUtils.js'

export const featureCode = 'thread'
const actionCodeHead = 'headpost'
const actionCodePost = 'post'

/*  Packet structure for thread actions:
    {
      sourceEmail,
      targetEmail,
      appCode: "Social-via-Email",
      featureCode: "thread",
      actionCode: "headpost" / "post",
      post: Post,
    }

    Headpost: headPostUuid: null, parentPostUuid: null, subscribers: [all]
    Reply:    headPostUuid: <root uuid>, parentPostUuid: <direct parent uuid>, subscribers: []
*/

export function uiAddTimeline(message) {
  const { session, friends, timelines, setTimelines, fullPostMap, setFullPostMap } = useAppStore.getState()

  const currentUser = session.currentUser
  const subscribers = [currentUser.email, ...friends.map((f) => f.email)]
  const headpost = makePost(currentUser.email, message, { subscribers })

  fullPostMap.set(headpost.uuid, headpost)
  setFullPostMap(new Map(fullPostMap))
  setTimelines([...timelines, headpost.uuid])

  friends.forEach((f) => {
    const packet = makePacket(currentUser.email, f.email, featureCode, actionCodeHead, { post: headpost })
    sendEmail(packet)
  })
}

export function uiAddTimelinePost(message, headpost, parentPost) {
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

export function processPacket(packet) {
  const { addLog } = useAppStore.getState()
  addLog(`threadActions: processing packet from ${packet.sourceEmail} for ${packet.featureCode}/${packet.actionCode}`)

  const { timelines, setTimelines, fullPostMap, setFullPostMap } = useAppStore.getState()
  const post = packet.post

  if (fullPostMap.has(post.uuid)) return

  if (packet.actionCode === actionCodeHead) {

    fullPostMap.set(post.uuid, post)
    setFullPostMap(new Map(fullPostMap))
    setTimelines([...timelines, post.uuid])

  } else if (packet.actionCode === actionCodePost) {

    const parentPost = fullPostMap.get(post.parentPostUuid)
    if (!parentPost) return

    parentPost.childPostUuids.push(post.uuid)
    fullPostMap.set(post.uuid, post)
    setFullPostMap(new Map(fullPostMap))

  }
}
