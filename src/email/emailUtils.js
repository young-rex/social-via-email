import { useAppStore } from '../data/dataStore'
import * as gmail from './gmailUtils'
import * as outlook from './outlookUtils'

function delegate(fn) {
  return (...args) => {
    const { session } = useAppStore.getState()
    return session.emailVendor === 'outlook' ? outlook[fn](...args) : gmail[fn](...args)
  }
}

export const initializeLabels   = delegate('initializeLabels')
export const loadEmailToState   = delegate('loadEmailToState')
export const saveStateToEmail   = delegate('saveStateToEmail')
export const scanIncomingEmails = delegate('scanIncomingEmails')
export const sendEmail          = delegate('sendEmail')
