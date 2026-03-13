import { useState, useEffect } from 'react'
import SocialPage from './SocialPage'
import { navigate, getPath } from './router'
import { useAppStore } from '../data/dataStore'
import { handleSignIn } from '../gmail/gmailLogin'
import './LoginPage.css'

function LoginPage() {
  const [pathname, setPathname] = useState(getPath())
  const { session } = useAppStore()

  useEffect(() => {
    const onPopState = () => setPathname(getPath())
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

  return (
    <div className="container">
      <main className="main">
        <section className="title-section">
          <h1>Social via Email</h1>
        </section>

        <section className="login-section">
          <a
            href={`${import.meta.env.BASE_URL}social`}
            className="login-button"
            onClick={handleSignIn}
          >
            <img src={`${import.meta.env.BASE_URL}gmail.png`} alt="Gmail icon" className="gmail-icon" />
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
            during the 1-hour session — no cookies, and no data leaves the browser.
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
