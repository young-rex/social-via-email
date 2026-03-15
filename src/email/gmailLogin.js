import { makeContact, makeSession, useAppStore } from '../data/dataStore'
import { navigate } from '../pages/router'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'openid email profile https://www.googleapis.com/auth/gmail.modify'

export function handleSignIn(e) {
  e.preventDefault()
  const { setSession } = useAppStore.getState()

  window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        onError(tokenResponse)
      } else {
        onSuccess(tokenResponse)
      }
    },
  }).requestAccessToken()

  function onError() {
    setSession(makeSession())
    navigate('/')
  }

  function onSuccess(tokenResponse) {
    const accessToken = tokenResponse.access_token
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((resp) => {
        if (!resp.ok) throw new Error('Failed to fetch Gmail user info')
        return resp.json()
      })
      .then((data) => {
        setSession(makeSession({
          currentUser: makeContact(data.email, data.name || data.email.split('@')[0], data.picture || null),
          oauthToken: accessToken,
          lastLoginAt: Date.now(),
          emailVendor: 'gmail',
        }))
        navigate('/social')
      })
      .catch(() => {
        setSession(makeSession())
        navigate('/')
      })
  }
}
