import { useState } from 'react'
import { navigate } from './router'
import { makeSession, useAppStore } from './dataStore'
import FriendsTab from './FriendsTab'
import ChatsTab from './ChatsTab'
import TimelinesTab from './TimelinesTab'
import OperationsTab from './OperationsTab'
import './SocialPage.css'

const TABS = [
  { id: 'friends',    label: 'Friends' },
  { id: 'chats',      label: 'Chats' },
  { id: 'timelines',  label: 'Timelines' },
  { id: 'operations', label: 'Operations' },
]

function formatTs(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function SocialPage() {
  const { session, setSession } = useAppStore()
  const [activeTab, setActiveTab] = useState('operations')

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
        <div style={{ display: activeTab === 'friends'    ? 'contents' : 'none' }}><FriendsTab /></div>
        <div style={{ display: activeTab === 'chats'      ? 'contents' : 'none' }}><ChatsTab /></div>
        <div style={{ display: activeTab === 'timelines'  ? 'contents' : 'none' }}><TimelinesTab /></div>
        <div style={{ display: activeTab === 'operations' ? 'contents' : 'none' }}><OperationsTab /></div>
      </div>
    </div>
  )
}

export default SocialPage
