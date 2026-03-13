import { create } from 'zustand'

export function makePacket(sourceEmail, targetEmail, featureCode, actionCode, overrides = {}) {
  return {
    sourceEmail,
    targetEmail,
    appCode: "Social-via-Email",
    featureCode,
    actionCode,
    ...overrides,
  }
}

export function makeContact(email, name, imageUrl = null) {
  return {
    email: email.toLowerCase(),
    name: name || email.split('@')[0],
    imageUrl,
  }
}

export function makePost(author, text, overrides = {}) {
  return {
    uuid: crypto.randomUUID(),
    timestamp: Date.now(),
    author, // email
    text,   // text content
    subscribers: [],  // emails
    headPostUuid: null,
    childPostUuids: [],
    parentPostUuid: null,
    ...overrides,
  }
}

export function makeSession(overrides = {}) {
  return {
    currentUser: null,
    oauthToken: null,
    lastLoginAt: 0,
    lastScanAt: 0,
    lastSaveAt: 0,
    isDataDirty: false,
    gmailDataLabelId: null,
    ...overrides,
  }
}

export function makeLogEntry(message) {
  return { timestamp: Date.now(), message }
}

const initialState = {
  session:     makeSession(),
  logs:        [],
  contacts:    [],
  chats:       [],
  conversations: [],
  fullPostMap: new Map(),
}

export const useAppStore = create((set) => ({
  ...initialState,
  resetStore:  () => set({ ...initialState, fullPostMap: new Map() }),

  setSession:  (session) => set({ session }),

  addLog:      (message) => set((s) => ({ logs: [...s.logs, makeLogEntry(message)] })),
  clearLogs:   () => set({ logs: [] }),

  setContacts: (contacts) => set((s) => ({ contacts, session: { ...s.session, isDataDirty: true } })),

  setChats:    (chats) => set((s) => ({ chats, session: { ...s.session, isDataDirty: true } })),

  setConversations: (conversations) => set((s) => ({ conversations, session: { ...s.session, isDataDirty: true } })),

  setFullPostMap: (fullPostMap) => set((s) => ({ fullPostMap, session: { ...s.session, isDataDirty: true } })),
}))
