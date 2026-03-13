import { useAppStore, makePacket } from '../data/dataStore.js'
import { sendEmail } from '../gmail/gmailUtils.js'

export const featureCode = 'contact'
const actionCodeRequest = 'friend?'
const actionCodeAccept = 'friend!'

/*  Packet structure for contact actions:
    {
      sourceEmail,
      targetEmail,
      appCode: "Social-via-Email",
      featureCode: "contact",
      actionCode: "contact?" / "contact!",
      contact: Person,
    }
*/

export function uiAddContact(email) {
  const { session } = useAppStore.getState()
  const currentUser = session.currentUser

  const packet = makePacket(currentUser.email, email, featureCode, actionCodeRequest, {
    contact: currentUser,
  })

  sendEmail(packet)
}

export function processPacket(packet) {
  const { addLog } = useAppStore.getState()
  addLog(`contactActions: processing packet from ${packet.sourceEmail} for ${packet.featureCode}/${packet.actionCode}`)

  if (packet.sourceEmail !== packet.contact.email) return

  const { contacts, setContacts } = useAppStore.getState()
  if (contacts.some((f) => f.email === packet.contact.email)) return

  if (packet.actionCode === actionCodeAccept) {

    setContacts([...contacts, packet.contact])

  } else if (packet.actionCode === actionCodeRequest) {

    setContacts([...contacts, packet.contact])

    const { session } = useAppStore.getState()
    const currentUser = session.currentUser
    const respPacket = makePacket(currentUser.email, packet.contact.email, featureCode, actionCodeAccept, {
      contact: currentUser,
    })

    sendEmail(respPacket)
  }
}
