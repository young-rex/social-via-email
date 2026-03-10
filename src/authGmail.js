const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'openid email profile https://www.googleapis.com/auth/gmail.modify'

export function initTokenClient(onSuccess, onError) {
  return window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        onError(tokenResponse)
      } else {
        onSuccess(tokenResponse)
      }
    },
  })
}

export async function fetchUserInfo(accessToken) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Failed to fetch user info')
  const data = await res.json()
  return {
    email: data.email,
    name: data.name || data.email.split('@')[0],
    imageUrl: data.picture || null,
  }
}
