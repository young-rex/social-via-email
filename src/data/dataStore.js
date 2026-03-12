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

export function makePerson(email, name, imageUrl = null) {
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
    author,
    text,
    subscribers: [],
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

export const useAppStore = create((set) => ({
  session:     makeSession(),
  setSession:  (session) => set({ session }),

  opLogs:      [],
  addOpLog:    (message) => set((s) => ({ opLogs: [...s.opLogs, makeLogEntry(message)] })),
  clearOpLogs: () => set({ opLogs: [] }),

  friends:     [],
  setFriends:  (friends) => set((s) => ({ friends, session: { ...s.session, isDataDirty: true } })),

  chats:       [],
  setChats:    (chats) => set((s) => ({ chats, session: { ...s.session, isDataDirty: true } })),

  timelines:   [],
  setTimelines:(timelines) => set((s) => ({ timelines, session: { ...s.session, isDataDirty: true } })),

  fullPostMap:    new Map(),
  setFullPostMap: (fullPostMap) => set((s) => ({ fullPostMap, session: { ...s.session, isDataDirty: true } })),
}))
