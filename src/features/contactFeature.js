import { useAppStore, makeEnvelope } from '../data/dataStore.js'
import { sendEmail } from '../email/emailUtils'

export const feature = 'contact'
const actionCodeRequest = 'friend?'
const actionCodeAccept = 'friend!'

export function uiAddContact(email) {
  const { session } = useAppStore.getState()
  const currentUser = session.currentUser

  const envelope = makeEnvelope(`${email}#${feature}`, `${currentUser.email}#${feature}`, actionCodeRequest, {
    contact: currentUser,
  })

  sendEmail(envelope)
}

export function processEnvelope(envelope) {
  const { addLog } = useAppStore.getState()
  const [, targetFeature] = envelope.target.split('#')
  const [replytoEmail] = envelope.replyto.split('#')
  addLog(`contactActions: processing envelope from ${replytoEmail} for ${targetFeature}/${envelope.args.action}`)

  if (replytoEmail !== envelope.args.contact.email) return

  const { contacts, setContacts } = useAppStore.getState()
  if (contacts.some((c) => c.email === envelope.args.contact.email)) return

  if (envelope.args.action === actionCodeAccept) {

    setContacts([...contacts, envelope.args.contact])

  } else if (envelope.args.action === actionCodeRequest) {

    setContacts([...contacts, envelope.args.contact])

    const { session } = useAppStore.getState()
    const currentUser = session.currentUser
    const respEnvelope = makeEnvelope(`${envelope.args.contact.email}#${feature}`, `${currentUser.email}#${feature}`, actionCodeAccept, {
      contact: currentUser,
    })

    sendEmail(respEnvelope)
  }
}
