import { useAppStore } from '../data/dataStore'
import * as receptionistAction from './receptionistFeature'
import * as contactAction from './contactFeature'
import * as chatAction from './chatFeature'
import * as conversationAction from './conversationFeature'
import * as gpsTrackingAction from './gpsTrackingFeature'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function processEnvelope(envelope) {
  const { session } = useAppStore.getState()
  const currentEmail = session?.currentUser?.email

  const [targetEmail, targetFeature] = envelope.target.split('#')
  const [replytoEmail] = envelope.replyto.split('#')

  if (!EMAIL_REGEX.test(replytoEmail) || replytoEmail === targetEmail) return
  if (!currentEmail || currentEmail !== targetEmail) return

  if (targetFeature === receptionistAction.feature) receptionistAction.processEnvelope(envelope)
  else if (targetFeature === contactAction.feature) contactAction.processEnvelope(envelope)
  else if (targetFeature === chatAction.feature) chatAction.processEnvelope(envelope)
  else if (targetFeature === conversationAction.feature) conversationAction.processEnvelope(envelope)
  else if (targetFeature === gpsTrackingAction.feature) gpsTrackingAction.processEnvelope(envelope)
}
