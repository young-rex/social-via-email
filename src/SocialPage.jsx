import { useState } from 'react'
import { navigate } from './router'
import { makeSession } from './types'
import './SocialPage.css'

const TABS = [
  { id: 'friends', label: 'Friends' },
  { id: 'chats', label: 'Chats' },
  { id: 'timelines', label: 'Timelines' },
  { id: 'operations', label: 'Operations' },
]

const CONTENT = {
  friends: 'You selected Friends.',
  chats: 'You selected Chats.',
  timelines: 'You selected Timelines.',
  operations: 'You selected Operations.',
}

function formatTs(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function SocialPage({ session, setSession }) {
  const [activeTab, setActiveTab] = useState('friends')

  function handleSignOut() {
    setSession(makeSession())
    navigate('/')
  }

  return (
    <div className="social-layout">
      <header className="social-title">
        <h1>Social via Email</h1>
      </header>

      <div className="social-user-bar">
        <div className="social-user-info">
          {session.currentUser.imageUrl && (
            <img
              src={session.currentUser.imageUrl}
              alt="profile"
              className="social-user-avatar"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="social-user-text">
            <span className="social-user-name">{session.currentUser.name}</span>
            <span className="social-user-email">{session.currentUser.email}</span>
          </div>
        </div>
        <div className="social-action-buttons">
          <button className="social-action-btn" onClick={handleSignOut}>
            <span>Sign out</span>
            <span className="social-action-ts">last: {formatTs(session.lastLoginAt)}</span>
          </button>
          <button className="social-action-btn" title="Scan incoming emails">
            <span>Scan</span>
            <span className="social-action-ts">last: {formatTs(session.lastScanAt)}</span>
          </button>
          <button className="social-action-btn social-action-btn--save" title="Save state to email">
            <span>Save</span>
            <span className="social-action-ts">last: {formatTs(session.lastSaveAt)}</span>
            <span className="dirty-dot" style={{ visibility: session.isDataDirty ? 'visible' : 'hidden' }} />
          </button>
        </div>
      </div>

      <nav className="social-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`social-nav-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="social-content">
        <p>{CONTENT[activeTab]}</p>
      </div>
    </div>
  )
}

export default SocialPage
