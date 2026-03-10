import { useState } from 'react'
import { navigate } from './router'
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

function SocialPage() {
  const [activeTab, setActiveTab] = useState('friends')

  return (
    <div className="social-layout">
      <header className="social-title">
        <h1>Social via Email</h1>
      </header>

      <div className="social-user-bar">
        <div className="social-user-info">
          <span className="social-user-name">Alice Smith</span>
          <span className="social-user-email">alice@smith-family.com</span>
        </div>
        <div className="social-action-buttons">
          <button className="social-action-btn" onClick={() => navigate('/')}>
            <span>Logout</span>
            <span className="social-action-ts">last: 15:30</span>
          </button>
          <button className="social-action-btn" title="Scan incoming emails">
            <span>Scan</span>
            <span className="social-action-ts">last: 15:30</span>
          </button>
          <button className="social-action-btn social-action-btn--save" title="Save state to email">
            <span>Save</span>
            <span className="social-action-ts">last: 15:30</span>
            <span className="dirty-dot" />
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
