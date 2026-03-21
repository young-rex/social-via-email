import { useAppStore, makeEnvelope } from '../data/dataStore.js'
import { sendEmail } from '../email/emailUtils'
import * as contactFeature from './contactFeature.js'

export const feature = 'receptionist'
const actionReq = 'list-features'
const actionResp = 'feature-list'

export function sendActionRequest(email, referer) {
  const { session } = useAppStore.getState()
  const currentUser = session.currentUser

  const envelope = makeEnvelope(
    `${email}#${feature}`,
    `${currentUser.email}#${feature}`,
    actionReq,
    { referer }
  )
  sendEmail(envelope)
}

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
      { features: ['receptionist', 'contact', 'chat', 'conversation'], ...(envelope.args.referer && { referer: envelope.args.referer }) }
    )
    sendEmail(respEnvelope)
  } else if (envelope.args.action === actionResp) {
    if (envelope.args.referer === 'new-contact' && envelope.args.features.includes('contact')) {
      contactFeature.sendActionRequest(replytoEmail)
    }
  }
}
