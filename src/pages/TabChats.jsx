import { useState } from 'react'
import { useAppStore } from '../data/dataStore'
import { uiAddHeadPost, uiAddPost, uiUnsubscribe } from '../features/chatFeature'

function NoFriendsDialog({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', color: '#111', padding: '1.5em 2em', borderRadius: '8px', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '0.75em' }}>
        <p style={{ margin: 0 }}>Please add contacts to chat</p>
        <button onClick={onClose} style={{ alignSelf: 'flex-end' }}>Close</button>
      </div>
    </div>
  )
}

function AddChatDialog({ contacts, onClose }) {
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState({})
  const [error, setError] = useState('')

  const visibleContacts = contacts.slice(0, 6)

  function toggleContact(email) {
    setSelected((prev) => ({ ...prev, [email]: !prev[email] }))
  }

  function handleConfirm() {
    const selectedContacts = visibleContacts.filter((c) => selected[c.email])
    if (selectedContacts.length === 0) {
      setError('Please select at least one contact.')
      return
    }
    if (!message.trim()) {
      setError('Please type a message.')
      return
    }

    const { chats, fullPostMap, session } = useAppStore.getState()
    const newGroup = new Set([session.currentUser.email, ...selectedContacts.map((c) => c.email)])
    const hasActiveChat = chats.some((uuid) => {
      const post = fullPostMap.get(uuid)
      if (!post) return false
      const existing = new Set(post.subscribers)
      return existing.size === newGroup.size && [...newGroup].every((e) => existing.has(e))
    })
    if (hasActiveChat) {
      setError('You have an active chat with them.')
      return
    }

    setError('')
    uiAddHeadPost(message.trim(), selectedContacts)
    onClose()
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', color: '#111', padding: '1.5em 2em', borderRadius: '8px', minWidth: '360px', display: 'flex', flexDirection: 'column', gap: '0.75em' }}>
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5em' }}>
              {visibleContacts.map((c) => (
                <label key={c.email} className="social-user-info" style={{ marginBottom: 0, cursor: 'pointer', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={!!selected[c.email]}
                    onChange={() => toggleContact(c.email)}
                    style={{ marginRight: '0.4em', flexShrink: 0 }}
                  />
                  {c.imageUrl && (
                    <img
                      src={c.imageUrl}
                      alt="profile"
                      className="social-user-avatar"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="social-user-text">
                    <span className="social-user-name">{c.name}</span>
                    <span className="social-user-email">{c.email}</span>
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
      </div>
    </div>
  )
}

function UnsubscribeConfirmDialog({ onConfirm, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', color: '#111', padding: '1.5em 2em', borderRadius: '8px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '0.75em' }}>
        <p style={{ margin: 0 }}>Are you sure you want to unsubscribe from this chat?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5em' }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm} style={{ color: '#c00' }}>Unsubscribe</button>
        </div>
      </div>
    </div>
  )
}

function hhmm(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function ChatRow({ post: headpost, resolveContact, fullPostMap, currentUser, onUnsubscribe }) {
  const [expanded, setExpanded] = useState(false)
  const [reply, setReply] = useState('')
  const [showUnsub, setShowUnsub] = useState(false)

  const author = resolveContact(headpost.author)
  const subscribers = (headpost.subscribers || [])
    .filter((email) => email !== headpost.author)
    .map(resolveContact)
  const childPosts = [headpost, ...(headpost.childPostUuids || []).map((id) => fullPostMap.get(id)).filter(Boolean)]

  return (
    <li style={{ marginBottom: '0.75em', borderBottom: '1px solid #eee', paddingBottom: '0.6em' }}>

      {/* Author row: big avatar + name/email two-line, then '+' and subscribers to the right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            <span className="social-user-name" style={{ lineHeight: 1.2 }}>{author.name}</span>
            <span className="social-user-email" style={{ lineHeight: 1.2 }}>{author.email}</span>
          </div>
        </div>
        {subscribers.length > 0 && (
          <>
            <span style={{ width: '24px', height: '24px', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5, fontWeight: 400, flexShrink: 0 }}>+</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2em' }}>
              {[subscribers.filter((_, i) => i % 2 === 0), subscribers.filter((_, i) => i % 2 !== 0)].filter(row => row.length > 0).map((row, ri) => (
                <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
                  {row.map((p) => (
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
              ))}
            </div>
          </>
        )}
      </div>

      {/* Triangle toggle + head post title + timestamp */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.3em', marginTop: '1em', paddingLeft: 'calc(40px + 0.75rem)' }}>
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75em', color: '#888', padding: '0.2em 0', lineHeight: 1, flexShrink: 0, alignSelf: 'flex-start', marginTop: '0.2em' }}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? '▼' : '▶'}
        </button>
        <div style={{ fontSize: '1.05em' }}>
          <span style={{ whiteSpace: 'pre-wrap' }}>{headpost.text}</span>
          <span style={{ paddingLeft: '1em', opacity: 0.45, fontSize: '0.85em' }}>{hhmm(headpost.timestamp)}</span>
          <button
            onClick={() => setShowUnsub(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78em', color: '#c00', padding: '0.2em 0.4em' }}
          >
            Unsubscribe
          </button>
        </div>
      </div>

      {/* Expanded: child posts + reply input */}
      {expanded && (
        <div style={{ paddingLeft: 'calc(40px + 0.75rem + 1.2em)', marginTop: '0.5em', display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
          {childPosts.map((child) => {
            const childAuthor = resolveContact(child.author)
            const isMine = child.author === currentUser?.email
            const ts = hhmm(child.timestamp)
            const avatar = childAuthor.imageUrl && (
              <img
                src={childAuthor.imageUrl}
                alt={childAuthor.name}
                title={childAuthor.email}
                referrerPolicy="no-referrer"
                style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, cursor: 'default' }}
              />
            )
            const name = <span style={{ fontWeight: 600, flexShrink: 0 }} title={childAuthor.email}>{childAuthor.name.split(' ')[0]}</span>
            const tsSpan = <span style={{ opacity: 0.45, fontSize: '0.85em', flexShrink: 0 }}>{ts}</span>
            return (
              <div key={child.uuid} style={{ display: 'flex', flexDirection: 'column', gap: '0.15em', fontSize: '0.9em' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  {isMine ? <>{tsSpan}{name}{avatar}</> : <>{avatar}{name}{tsSpan}</>}
                </div>
                <div style={{ paddingLeft: isMine ? 0 : 'calc(18px + 0.4em)', paddingRight: isMine ? 'calc(18px + 0.4em)' : 0, textAlign: isMine ? 'right' : 'left', whiteSpace: 'pre-wrap' }}>
                  {child.text}
                </div>
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
              Send
            </button>
          </div>
        </div>
      )}

      {showUnsub && (
        <UnsubscribeConfirmDialog
          onConfirm={() => { setShowUnsub(false); onUnsubscribe(headpost) }}
          onClose={() => setShowUnsub(false)}
        />
      )}

    </li>
  )
}

function TabChats() {
  const chats = useAppStore((s) => s.chats)
  const fullPostMap = useAppStore((s) => s.fullPostMap)
  const contacts = useAppStore((s) => s.contacts)
  const currentUser = useAppStore((s) => s.session.currentUser)
  const [showDialog, setShowDialog] = useState(false)
  const [noContacts, setNoContacts] = useState(false)

  function resolveContact(email) {
    if (currentUser?.email === email) return currentUser
    return contacts.find((c) => c.email === email) ?? { email, name: email }
  }

  function handleAddClick() {
    if (contacts.length === 0) {
      setNoContacts(true)
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
              <ChatRow key={uuid} post={headpost} resolveContact={resolveContact} fullPostMap={fullPostMap} currentUser={currentUser} onUnsubscribe={uiUnsubscribe} />
            )
          })}
        </ul>
        </p>
      )}
      {noContacts && <NoFriendsDialog onClose={() => setNoContacts(false)} />}
      {showDialog && <AddChatDialog contacts={contacts} onClose={() => setShowDialog(false)} />}
    </div>
  )
}

export default TabChats
