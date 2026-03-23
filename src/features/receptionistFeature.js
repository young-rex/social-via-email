import { useAppStore, makeEnvelope } from '../data/dataStore.js'
import { sendEmail } from '../email/emailUtils'
import * as contactFeature from './contactFeature.js'
import { contactReferer } from './contactFeature.js'
import { feature as chatFeatureName } from './chatFeature.js'
import { feature as conversationFeatureName } from './conversationFeature.js'
import { feature as gpsTrackingFeatureName } from './gpsTrackingFeature.js'

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
      { features: [feature, contactFeature.feature, chatFeatureName, conversationFeatureName, gpsTrackingFeatureName], ...(envelope.args.referer && { referer: envelope.args.referer }) }
    )
    sendEmail(respEnvelope)

    addLog(`receptionistFeature: Sending feature list to ${replytoEmail}`)

  } else if (envelope.args.action === actionResp) {

    if (envelope.args.referer === contactReferer && envelope.args.features.includes(contactFeature.feature)) {
      addLog(`receptionistFeature: Target email ${replytoEmail} supports contact feature. Sending contact request.`)
      contactFeature.sendActionRequest(replytoEmail)
      const { showInfoDialog } = useAppStore.getState()
      showInfoDialog(`${replytoEmail} supports contact feature. Contact request sent.`)
    }
  }
}
