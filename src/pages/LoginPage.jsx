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
          <p>Social via Email is a proof-of-concept for the Lemitar vision: promoting independent IDs, apps, and data ownership for personal social needs.</p>
          <p>Social via Email uses email addresses as Lemitar IDs (while domain names might be more ideal, email offers built-in delivery and universality). It demonstrates two core data models—linear and tree-structured conversations—from which nearly all social features derive.</p>
          <ul>
            <li>Contacts — email addresses as IDs, with names and other attributes</li>
            <li>Chats — private 1:1 or group linear conversations</li>
            <li>Conversations — tree-structured discussions</li>
          </ul>
          <p className="key-principle"><strong>Core principle: You own everything.</strong></p>
          <ul>
            <li>You own your ID — your email address.</li>
            <li>You own your app — Social via Email is fully open source (MIT license). Build your own (fork + AI-assisted coding), use similar open-source apps, or buy/rent from small developers.</li>
            <li>You own your data — your contacts, chats, and conversations are stored entirely in your own email account.</li>
          </ul>
          <p></p>
          <p className="key-principle"><strong>Social via Email is secure and privacy-focused.</strong></p>
          <p>It is a pure client-side React app with no server-side code. It uses Gmail login via OAuth 2.0 (short-lived access token only; no credentials are stored). All runtime data lives in browser memory (no cookies or persistent storage) and is automatically cleared when you close or refresh the tab, the OAuth access token expires (after 1 hour), or you sign out.</p>
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
