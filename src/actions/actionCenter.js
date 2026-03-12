import { useAppStore } from '../data/dataStore'
import * as friendAction from './friendActions'
import * as chatAction from './chatActions'
import * as threadAction from './threadActions'

/*  Packet structure features:
    {
      sourceEmail,
      targetEmail,
      appCode: "Social-via-Email",
      featureCode: "friend" / "chat" / "thread",
      actionCode,
      ...overrides,
    }
*/

const APP_CODE = 'Social-via-Email'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function processPacket(packet) {
  const { session } = useAppStore.getState()
  const currentEmail = session?.currentUser?.email

  if (!currentEmail || currentEmail !== packet.targetEmail) return
  if (packet.appCode !== APP_CODE) return
  if (!EMAIL_REGEX.test(packet.sourceEmail) || packet.sourceEmail === packet.targetEmail) return

  if (packet.featureCode === friendAction.featureCode) friendAction.processPacket(packet)
  else if (packet.featureCode === chatAction.featureCode) chatAction.processPacket(packet)
  else if (packet.featureCode === threadAction.featureCode) threadAction.processPacket(packet)
}
