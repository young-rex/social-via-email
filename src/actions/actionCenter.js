import { useAppStore } from '../data/dataStore'
import * as contactAction from './contactActions'
import * as chatAction from './chatActions'
import * as conversationAction from './conversationActions'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function processEnvelope(envelope) {
  const { session } = useAppStore.getState()
  const currentEmail = session?.currentUser?.email

  const [targetEmail, targetFeature] = envelope.target.split('#')
  const [replytoEmail] = envelope.replyto.split('#')

  if (!EMAIL_REGEX.test(replytoEmail) || replytoEmail === targetEmail) return
  if (!currentEmail || currentEmail !== targetEmail) return

  if (targetFeature === contactAction.feature) contactAction.processEnvelope(envelope)
  else if (targetFeature === chatAction.feature) chatAction.processEnvelope(envelope)
  else if (targetFeature === conversationAction.feature) conversationAction.processEnvelope(envelope)
}
