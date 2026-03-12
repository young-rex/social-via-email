import { useState } from 'react'
import { useAppStore } from '../data/dataStore'
import { uiAddChat, uiAddPost } from '../actions/chatActions'

function NoFriendsDialog({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', color: '#111', padding: '1.5em 2em', borderRadius: '8px', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '0.75em' }}>
        <p style={{ margin: 0 }}>Please add friends to chat</p>
        <button onClick={onClose} style={{ alignSelf: 'flex-end' }}>Close</button>
      </div>
    </div>
  )
}

function AddChatDialog({ friends, onClose }) {
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const visibleFriends = friends.slice(0, 6)

  function toggleFriend(email) {
    setSelected((prev) => ({ ...prev, [email]: !prev[email] }))
  }

  function handleConfirm() {
    const selectedFriends = visibleFriends.filter((f) => selected[f.email])
    if (selectedFriends.length === 0) {
      setError('Please select at least one friend.')
      return
    }
    if (!message.trim()) {
      setError('Please type a message.')
      return
    }
    setError('')

    uiAddChat(message.trim(), selectedFriends)

    setSuccess(true)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', color: '#111', padding: '1.5em 2em', borderRadius: '8px', minWidth: '360px', display: 'flex', flexDirection: 'column', gap: '0.75em' }}>
        {success ? (
          <>
            <p style={{ margin: 0 }}>Your message has been sent.</p>
            <button onClick={onClose} style={{ alignSelf: 'flex-end' }}>Close</button>
          </>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5em' }}>
              {visibleFriends.map((f) => (
                <label key={f.email} className="social-user-info" style={{ marginBottom: 0, cursor: 'pointer', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={!!selected[f.email]}
                    onChange={() => toggleFriend(f.email)}
                    style={{ marginRight: '0.4em', flexShrink: 0 }}
                  />
                  {f.imageUrl && (
                    <img
                      src={f.imageUrl}
                      alt="profile"
                      className="social-user-avatar"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="social-user-text">
                    <span className="social-user-name">{f.name}</span>
                    <span className="social-user-email">{f.email}</span>
                  </div>
                </label>
              ))}
            </div>
            <label htmlFor="chat-message" style={{ fontWeight: 600 }}>Please type a message</label>
            <textarea
              id="chat-message"
              rows={3}
              value={message}
              onChange={(e) => { setMessage(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{ padding: '0.4em', fontSize: '1em', resize: 'none', overflowY: 'auto' }}
            />
            {error && <span style={{ color: 'red', fontSize: '0.85em' }}>{error}</span>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5em' }}>
              <button onClick={onClose}>Cancel</button>
              <button onClick={handleConfirm}>Confirm</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ChatRow({ post: headpost, resolvePerson, fullPostMap, currentUser }) {
  const [expanded, setExpanded] = useState(false)
  const [reply, setReply] = useState('')

  const author = resolvePerson(headpost.author)
  const subscribers = (headpost.subscribers || [])
    .filter((email) => email !== headpost.author)
    .map(resolvePerson)
  const childPosts = [headpost, ...(headpost.childPostUuids || []).map((id) => fullPostMap.get(id)).filter(Boolean)]

  return (
    <li style={{ marginBottom: '0.75em', borderBottom: '1px solid #eee', paddingBottom: '0.6em' }}>

      {/* Author row: big icon on left, two tight lines on right */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        {author.imageUrl && (
          <img
            src={author.imageUrl}
            alt="profile"
            className="social-user-avatar"
            referrerPolicy="no-referrer"
            style={{ flexShrink: 0 }}
          />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.05em', minWidth: 0 }}>
          {/* Line 1: name | email */}
          <span className="social-user-name" style={{ lineHeight: 1.2 }}>
            {author.name}
            <span style={{ fontWeight: 400, opacity: 0.65, fontSize: '0.88em', margin: '0 0.4em' }}>|</span>
            <span style={{ fontWeight: 400, opacity: 0.65, fontSize: '0.88em' }}>{author.email}</span>
          </span>
          {/* Line 2: subscribers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em', flexWrap: 'wrap', lineHeight: 1.2 }}>
            {subscribers.map((p) => (
              <span key={p.email} title={`${p.name} | ${p.email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.2em', fontSize: '0.78em', color: '#555' }}>
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                )}
                {p.name.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Triangle toggle + message on same row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.3em', marginTop: '0.3em', paddingLeft: 'calc(40px + 0.75rem)' }}>
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75em', color: '#888', padding: '0.2em 0', lineHeight: 1, flexShrink: 0, marginTop: '0.2em' }}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? '▼' : '▶'}
        </button>
        <div
          style={{ fontSize: '1.05em', whiteSpace: 'pre-wrap', flex: 1 }}
        >
          {headpost.text}
        </div>
      </div>

      {/* Expanded: child posts + reply input */}
      {expanded && (
        <div style={{ paddingLeft: 'calc(40px + 0.75rem + 1.2em)', marginTop: '0.5em', display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
          {childPosts.length > 0 && childPosts.map((child) => {
            const childAuthor = resolvePerson(child.author)
            const firstName = childAuthor.name.split(' ')[0]
            const isMine = child.author === currentUser?.email
            const hhmm = new Date(child.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
            const tsSpan = <span style={{ opacity: 0.45, fontSize: '0.85em', flexShrink: 0 }}>{hhmm}</span>
            return (
              <div key={child.uuid} style={{ display: 'flex', alignItems: 'baseline', gap: '0.35em', justifyContent: isMine ? 'flex-start' : 'flex-end', fontSize: '0.9em' }}>
                {isMine
                  ? <>{tsSpan}<span><span style={{ fontWeight: 600 }}>{firstName}</span>{': '}{child.text}</span></>
                  : <><span>{child.text}{' :'}<span style={{ fontWeight: 600 }}>{firstName}</span></span>{tsSpan}</>
                }
              </div>
            )
          })}

          {/* Reply input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3em', marginTop: '0.25em' }}>
            <textarea
              rows={2}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply…"
              style={{ padding: '0.4em', fontSize: '0.95em', resize: 'none', overflowY: 'auto' }}
            />
            <button
              onClick={() => {
                if (!reply.trim()) return
                uiAddPost(reply.trim(), headpost)
                setReply('')
              }}
              style={{ alignSelf: 'flex-end', padding: '0.2em 0.9em' }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

    </li>
  )
}

function TabChats() {
  const chats = useAppStore((s) => s.chats)
  const fullPostMap = useAppStore((s) => s.fullPostMap)
  const friends = useAppStore((s) => s.friends)
  const currentUser = useAppStore((s) => s.session.currentUser)
  const [showDialog, setShowDialog] = useState(false)
  const [noFriends, setNoFriends] = useState(false)

  function resolvePerson(email) {
    if (currentUser?.email === email) return currentUser
    return friends.find((f) => f.email === email) ?? { email, name: email }
  }

  function handleAddClick() {
    if (friends.length === 0) {
      setNoFriends(true)
    } else {
      setShowDialog(true)
    }
  }

  return (
    <div className="tab-content">
      <button
        onClick={handleAddClick}
        style={{ fontSize: '0.75em', padding: '0.25em 1em', border: '1px solid green', color: 'green' }}
      >
        Add a new chat
      </button>
      {chats.length === 0 ? (
        <p>Please add new chats</p>
      ) : (
        <p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {chats.map((uuid) => {
            const headpost = fullPostMap.get(uuid)
            if (!headpost) return null
            return (
              <ChatRow key={uuid} post={headpost} resolvePerson={resolvePerson} fullPostMap={fullPostMap} currentUser={currentUser} />
            )
          })}
        </ul>
        </p>
      )}
      {noFriends && <NoFriendsDialog onClose={() => setNoFriends(false)} />}
      {showDialog && <AddChatDialog friends={friends} onClose={() => setShowDialog(false)} />}
    </div>
  )
}

export default TabChats
