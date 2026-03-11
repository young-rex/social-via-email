import { create } from 'zustand'

export function makePerson(email, name, imageUrl = null) {
  return {
    email: email.toLowerCase(),
    name: name || email.split('@')[0],
    imageUrl,
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
    ...overrides,
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

export const useAppStore = create((set) => ({
  session:     makeSession(),
  setSession:  (session) => set({ session }),

  friends:     [],
  setFriends:  (friends) => set({ friends }),

  chats:       [],
  setChats:    (chats) => set({ chats }),

  timelines:   [],
  setTimelines:(timelines) => set({ timelines }),

  fullPostMap:    new Map(),
  setFullPostMap: (fullPostMap) => set({ fullPostMap }),
}))
