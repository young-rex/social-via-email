import { useState } from 'react'
import { navigate } from './router'
import { useAppStore } from '../data/dataStore'
import { scanIncomingEmails, saveStateToEmail } from '../gmail/gmailUtils'
import TabContacts from './TabContacts'
import TabChats from './TabChats'
import TabConversations from './TabConversations'
import TabLogs from './TabLogs'
import './SocialPage.css'

const TABS = [
  { id: 'contacts',      label: 'Contacts' },
  { id: 'chats',         label: 'Chats' },
  { id: 'conversations', label: 'Conversations' },
  { id: 'logs',       label: 'Logs' },
]

function formatTs(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function SocialPage() {
  const { session } = useAppStore()
  const [activeTab, setActiveTab] = useState('logs')

  function handleSignOut() {
    useAppStore.getState().resetStore()
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
            <span className="social-action-ts">✓ {formatTs(session.lastLoginAt)}</span>
          </button>
          <button className="social-action-btn" title="Scan incoming emails" onClick={() => scanIncomingEmails()}>
            <span>Scan</span>
            <span className="social-action-ts">✓ {formatTs(session.lastScanAt)}</span>
          </button>
          <button className="social-action-btn social-action-btn--save" title="Save state to email" onClick={() => saveStateToEmail()}>
            <span>Save</span>
            <span className="social-action-ts">✓ {formatTs(session.lastSaveAt)}</span>
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
        <div style={{ display: activeTab === 'contacts'      ? 'contents' : 'none' }}><TabContacts /></div>
        <div style={{ display: activeTab === 'chats'         ? 'contents' : 'none' }}><TabChats /></div>
        <div style={{ display: activeTab === 'conversations' ? 'contents' : 'none' }}><TabConversations /></div>
        <div style={{ display: activeTab === 'logs' ? 'contents' : 'none' }}><TabLogs /></div>
      </div>
    </div>
  )
}

export default SocialPage
