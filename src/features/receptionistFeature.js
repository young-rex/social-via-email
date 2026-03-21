import { useAppStore, makeEnvelope } from '../data/dataStore.js'
import { sendEmail } from '../email/emailUtils'

export const feature = 'receptionist'
const actionReq = 'list-features'
const actionResp = 'feature-list'

export function processEnvelope(envelope) {
  const { addLog } = useAppStore.getState()
  const [, targetFeature] = envelope.target.split('#')
  const [replytoEmail] = envelope.replyto.split('#')
  addLog(`receptionistFeature: processing envelope from ${replytoEmail} for ${targetFeature}/${envelope.args.action}`)

  if (envelope.args.action === actionReq) {
    const { session } = useAppStore.getState()
    const currentUser = session.currentUser

    const respEnvelope = makeEnvelope(
      `${replytoEmail}#${feature}`,
      `${currentUser.email}#${feature}`,
      actionResp,
      { features: ['receptionist', 'contact', 'chat', 'conversation'] }
    )
    sendEmail(respEnvelope)
  }
}
