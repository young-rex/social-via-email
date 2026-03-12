import { useAppStore } from '../data/dataStore'
import * as friendAction from './friendAction'
import * as chatAction from './chatAction'
import * as threadAction from './threadAction'

const APP_CODE = 'Social-via-Email'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function processPacket(packet) {
  const { session } = useAppStore.getState()
  const currentEmail = session?.currentUser?.email

  if (!currentEmail || currentEmail !== packet.targetEmail) return
  if (packet.appCode !== APP_CODE) return
  if (!EMAIL_REGEX.test(packet.sourceEmail) || packet.sourceEmail === packet.targetEmail) return

  if (packet.featureCode === friendAction.actionCode) friendAction.processPacket(packet)
  else if (packet.featureCode === chatAction.actionCode) chatAction.processPacket(packet)
  else if (packet.featureCode === threadAction.actionCode) threadAction.processPacket(packet)
}
