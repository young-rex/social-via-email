import { useAppStore, makePacket } from '../data/dataStore.js'
import { sendEmail } from '../gmail/gmailUtils.js'

export const featureCode = 'friend'
const actionCodeRequest = 'friend?'
const actionCodeAccept = 'friend!'

/*  Packet structure for friend actions:
    {
      sourceEmail,
      targetEmail,
      appCode: "Social-via-Email",
      featureCode: "friend",
      actionCode: "friend?" / "friend!",
      friend: Person,
    }
*/

export function uiAddFriend(email) {
  const { session } = useAppStore.getState()
  const currentUser = session.currentUser

  const packet = makePacket(currentUser.email, email, featureCode, actionCodeRequest, {
    friend: currentUser,
  })

  sendEmail(packet)
}

export function processPacket(packet) {
  const { addLog } = useAppStore.getState()
  addLog(`friendActions: processing packet from ${packet.sourceEmail} for ${packet.featureCode}/${packet.actionCode}`)

  if (packet.sourceEmail !== packet.friend.email) return

  const { friends, setFriends } = useAppStore.getState()
  if (friends.some((f) => f.email === packet.friend.email)) return

  if (packet.actionCode === actionCodeAccept) {

    setFriends([...friends, packet.friend])

  } else if (packet.actionCode === actionCodeRequest) {

    setFriends([...friends, packet.friend])

    const { session } = useAppStore.getState()
    const currentUser = session.currentUser
    const respPacket = makePacket(currentUser.email, packet.friend.email, featureCode, actionCodeAccept, {
      friend: currentUser,
    })

    sendEmail(respPacket)
  }
}
