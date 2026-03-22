import { useAppStore, makeEnvelope } from '../data/dataStore.js'
import { sendEmail } from '../email/emailUtils'

export const feature = 'gps-tracking'
const actionReq = 'read-gps'
const actionResp = 'gps-reading'

export function sendActionRequest(email) {
  const { session } = useAppStore.getState()
  const currentUser = session.currentUser

  const envelope = makeEnvelope(
    `${email}#${feature}`,
    `${currentUser.email}#${feature}`,
    actionReq,
  )
  sendEmail(envelope)
}

export function processEnvelope(envelope) {
  const { addLog } = useAppStore.getState()
  const [, targetFeature] = envelope.target.split('#')
  const [replytoEmail] = envelope.replyto.split('#')
  addLog(`gpsTrackingFeature: processing envelope from ${replytoEmail} for ${targetFeature}/${envelope.args.action}`)

  if (envelope.args.action === actionReq) {
    const { session } = useAppStore.getState()
    const currentUser = session.currentUser

    const respEnvelope = makeEnvelope(
      `${replytoEmail}#${feature}`,
      `${currentUser.email}#${feature}`,
      actionResp,
      {
        gps: {
          latitude: 48.8584,
          longitude: 2.2945,
          altitude: 35.0,
          accuracy: 5.0,
          altitudeAccuracy: 10.0,
          heading: 90.0,
          speed: 0.0,
          timestamp: new Date().toISOString(),
        },
      }
    )
    sendEmail(respEnvelope)

  } else if (envelope.args.action === actionResp) {
    addLog(`gpsTrackingFeature: received GPS reading — ${JSON.stringify(envelope.args.gps)}`)
  }
}
