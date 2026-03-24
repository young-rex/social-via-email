import { makeContact, makeSession, useAppStore } from '../data/dataStore'
import { navigate } from '../pages/router'

const CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID
const SCOPES = 'openid email profile Mail.ReadWrite Mail.Send User.Read'
const AUTHORITY = 'https://login.microsoftonline.com/consumers/oauth2/v2.0'

export function handleSignIn(e) {
  e.preventDefault()
  const { setSession } = useAppStore.getState()

  const redirectUri = window.location.origin + import.meta.env.BASE_URL + 'auth.html'
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'token',
    redirect_uri: redirectUri,
    scope: SCOPES,
    nonce: crypto.randomUUID(),
    response_mode: 'fragment',
  })

  const popup = window.open(
    `${AUTHORITY}/authorize?${params}`,
    'outlookAuth',
    'width=500,height=600,left=200,top=100'
  )

  const interval = setInterval(() => {
    try {
      if (popup.closed) {
        clearInterval(interval)
        window.location.href = import.meta.env.BASE_URL
        return
      }
      const hash = popup.location.hash
      if (hash && hash.includes('access_token=')) {
        clearInterval(interval)
        popup.close()
        onSuccess(new URLSearchParams(hash.slice(1)).get('access_token'))
      }
    } catch {
      // Cross-origin while navigating to Microsoft login — keep polling
    }
  }, 200)

  function onSuccess(accessToken) {
    Promise.all([
      fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then((resp) => {
        if (!resp.ok) throw new Error('Failed to fetch Outlook user info')
        return resp.json()
      }),
      fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((resp) => (resp.ok ? resp.blob() : null))
        .then((blob) => blob ? new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        }) : null)
        .catch(() => null),
    ])
      .then(([data, imageUrl]) => {
        const email = data.mail || data.userPrincipalName
        setSession(
          makeSession({
            currentUser: makeContact(email, data.displayName || email.split('@')[0], imageUrl),
            oauthToken: accessToken,
            lastLoginAt: Date.now(),
            emailVendor: 'outlook',
          })
        )
        navigate('/social')
      })
      .catch(() => {
        window.location.href = import.meta.env.BASE_URL
      })
  }
}
