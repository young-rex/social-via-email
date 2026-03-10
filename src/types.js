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
