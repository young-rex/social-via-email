import { useState, useEffect } from 'react'
import SocialPage from './SocialPage'
import { navigate } from './router'
import { makePerson, makeSession, useAppStore } from './data/dataStore'
import { initTokenClient, fetchUserInfo } from './gmail/gmailUtils'
import './LoginPage.css'

function LoginPage() {
  const [pathname, setPathname] = useState(window.location.pathname)
  const { session, setSession } = useAppStore()

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const isLoggedIn = session.currentUser !== null

  // Route guards
  useEffect(() => {
    if (isLoggedIn && pathname === '/') navigate('/social')
    if (!isLoggedIn && pathname === '/social') navigate('/')
  }, [isLoggedIn, pathname])

  if (pathname === '/social' && isLoggedIn) {
    return <SocialPage />
  }

  function handleSignIn(e) {
    e.preventDefault()
    function onSuccess(tokenResponse) {
      // set oauthToken first so fetchUserInfo can read it from the store
      setSession(makeSession({ oauthToken: tokenResponse.access_token, lastLoginAt: Date.now() }))
      fetchUserInfo()
        .then(({ email, name, imageUrl }) => {
          const person = makePerson(email, name, imageUrl)
          setSession(makeSession({
            currentUser: person,
            oauthToken: tokenResponse.access_token,
            lastLoginAt: Date.now(),
          }))
          navigate('/social')
        })
        .catch(() => {
          setSession(makeSession())
          navigate('/')
        })
    }
    function onError() {
      setSession(makeSession())
      navigate('/')
    }
    const tokenClient = initTokenClient(onSuccess, onError)
    tokenClient.requestAccessToken()
  }

  return (
    <div className="container">
      <main className="main">
        <section className="title-section">
          <h1>Social via Email</h1>
        </section>

        <section className="login-section">
          <a
            href="/social"
            className="login-button"
            onClick={handleSignIn}
          >
            <img src="/gmail.png" alt="Gmail icon" className="gmail-icon" />
            Sign in to your Gmail
          </a>
        </section>

        <section className="intro-section">
          <p>
            Social via Email (SvE) is a proof-of-concept (PoC) for Lemitar. It uses email addresses as Lemitar IDs to
            demonstrate the concept (though domain names are the ideal form for Lemitar IDs).
          </p>
          <p>SvE demonstrates three main social features:</p>
          <ul>
            <li>Friends (email addresses)</li>
            <li>Chats (linear conversation, 1:1 or group)</li>
            <li>Timelines of threads (tree-structured public discussions)</li>
          </ul>
          <p className="key-principle"><strong>Key principle: You own everything.</strong></p>
          <p>
            Your friends list, chats, and threads live in your own email account. SvE is open source — use the hosted
            version, run locally, or self-host. Your email is your identity and communication channel.
          </p>
          <p>
            SvE is a pure client-side React single-page application (SPA) with no server-side code. It requires Gmail
            login via OAuth 2.0 (only short-lived access token; no credentials stored). All data stays in browser memory
            during the ~1-hour session — no cookies, and no data leaves the browser.
          </p>
        </section>
      </main>

      <footer className="footer">
        <a href="https://github.com/lemina-model/social-via-email" target="_blank" rel="noopener noreferrer">
          View on GitHub at https://github.com/lemina-model/social-via-email
        </a>
      </footer>
    </div>
  )
}

export default LoginPage
