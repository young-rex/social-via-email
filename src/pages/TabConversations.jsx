import { useState } from 'react'
import { useAppStore } from '../data/dataStore'
import { uiAddConversation, uiAddConversationPost } from '../actions/conversationActions'

function AddConversationDialog({ contacts, onClose }) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleConfirm() {
    if (!message.trim()) {
      setError('Please type a message.')
      return
    }
    setError('')
    uiAddConversation(message.trim())
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
            <p style={{ margin: 0 }}>Your conversation post has been sent.</p>
            <button onClick={onClose} style={{ alignSelf: 'flex-end' }}>Close</button>
          </>
        ) : (
          <>
            {contacts.length === 0 && (
              <p style={{ margin: 0, color: '#888', fontSize: '0.85em' }}>You have no contacts yet — this post will only be visible to you.</p>
            )}
            <label htmlFor="conversation-message" style={{ fontWeight: 600 }}>What's on your mind?</label>
            <textarea
              id="conversation-message"
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

function ReplyPopup({ headpost, replyTarget, resolvePerson, onConfirm, onClose }) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const targetAuthor = resolvePerson(replyTarget.author)

  function handleConfirm() {
    if (!message.trim()) {
      setError('Please type a message.')
      return
    }
    uiAddConversationPost(message.trim(), headpost, replyTarget)
    onConfirm()
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', color: '#111', padding: '1.5em 2em', borderRadius: '8px', minWidth: '360px', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '0.75em' }}>
        <span style={{ fontWeight: 600 }}>Reply</span>

        {/* Target post context */}
        <div style={{ background: '#f5f5f5', borderRadius: '6px', padding: '0.75em', display: 'flex', flexDirection: 'column', gap: '0.35em' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
            {targetAuthor.imageUrl && (
              <img
                src={targetAuthor.imageUrl}
                alt="profile"
                className="social-user-avatar"
                referrerPolicy="no-referrer"
                style={{ flexShrink: 0 }}
              />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.05em', minWidth: 0 }}>
              <span className="social-user-name" style={{ lineHeight: 1.2 }}>
                {targetAuthor.name}
                <span style={{ fontWeight: 400, opacity: 0.65, fontSize: '0.88em', margin: '0 0.4em' }}>|</span>
                <span style={{ fontWeight: 400, opacity: 0.65, fontSize: '0.88em' }}>{targetAuthor.email}</span>
              </span>
            </div>
          </div>
          <div style={{ fontSize: '0.9em', whiteSpace: 'pre-wrap', color: '#333' }}>{replyTarget.text}</div>
        </div>

        <textarea
          rows={3}
          value={message}
          onChange={(e) => { setMessage(e.target.value); setError('') }}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder="Write your reply…"
          style={{ padding: '0.4em', fontSize: '1em', resize: 'none', overflowY: 'auto' }}
        />
        {error && <span style={{ color: 'red', fontSize: '0.85em' }}>{error}</span>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5em' }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

function hhmm(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function ReplyNode({ post, fullPostMap, resolvePerson, setReplyTarget }) {
  const [expanded, setExpanded] = useState(false)
  const author = resolvePerson(post.author)
  const hasChildren = post.childPostUuids.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25em' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em', fontSize: '0.9em' }}>
        {hasChildren ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75em', color: '#888', padding: 0, lineHeight: 1, width: '1em', textAlign: 'center', flexShrink: 0 }}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '▼' : '▶'}
          </button>
        ) : (
          <button style={{ background: 'none', border: 'none', fontSize: '0.75em', padding: 0, lineHeight: 1, width: '1em', textAlign: 'center', flexShrink: 0, visibility: 'hidden', pointerEvents: 'none' }}>▶</button>
        )}
        {author.imageUrl && (
          <img
            src={author.imageUrl}
            alt={author.name}
            title={author.email}
            referrerPolicy="no-referrer"
            style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, cursor: 'default' }}
          />
        )}
        <span style={{ fontWeight: 600, flexShrink: 0 }} title={author.email}>{author.name.split(' ')[0]}</span>
        <span style={{ whiteSpace: 'pre-wrap' }}>{post.text}</span>
        <span style={{ opacity: 0.45, fontSize: '0.85em', flexShrink: 0 }}>{hhmm(post.timestamp)}</span>
        <button
          onClick={() => setReplyTarget(post)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78em', color: '#1a73e8', padding: '0.2em 0.4em', flexShrink: 0 }}
        >
          Reply
        </button>
      </div>
      {expanded && hasChildren && (
        <div style={{ borderLeft: '2px solid #ddd', paddingLeft: '0.75em', display: 'flex', flexDirection: 'column', gap: '0.5em', marginLeft: '0.6em' }}>
          {post.childPostUuids.map((uuid) => {
            const child = fullPostMap.get(uuid)
            if (!child) return null
            return (
              <ReplyNode key={uuid} post={child} fullPostMap={fullPostMap} resolvePerson={resolvePerson} setReplyTarget={setReplyTarget} />
            )
          })}
        </div>
      )}
    </div>
  )
}

function ConversationRow({ post: headpost, resolvePerson, fullPostMap }) {
  const [expanded, setExpanded] = useState(false)
  const [replyTarget, setReplyTarget] = useState(null)

  const author = resolvePerson(headpost.author)
  const subscribers = (headpost.subscribers || [])
    .filter((email) => email !== headpost.author)
    .map(resolvePerson)

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

      {/* Triangle toggle + headpost text + timestamp + Reply button */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.3em', marginTop: '1em', paddingLeft: 'calc(40px + 0.75rem)' }}>
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75em', color: '#888', padding: '0.2em 0', lineHeight: 1, flexShrink: 0, alignSelf: 'flex-start', marginTop: '0.2em' }}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? '▼' : '▶'}
        </button>
        <div style={{ fontSize: '1.05em', whiteSpace: 'pre-wrap' }}>{headpost.text}</div>
        <span style={{ opacity: 0.45, fontSize: '0.85em', flexShrink: 0 }}>{hhmm(headpost.timestamp)}</span>
        <button
          onClick={() => setReplyTarget(headpost)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78em', color: '#1a73e8', padding: '0.2em 0.4em', flexShrink: 0 }}
        >
          Reply
        </button>
      </div>

      {/* Expanded: replies tree (recursive) */}
      {expanded && (
        <div style={{ paddingLeft: 'calc(40px + 0.75rem + 1.2em)', marginTop: '0.5em', display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
          {headpost.childPostUuids.length === 0 ? (
            <span style={{ color: '#aaa', fontSize: '0.85em' }}>No replies yet.</span>
          ) : (
            headpost.childPostUuids.map((uuid) => {
              const child = fullPostMap.get(uuid)
              if (!child) return null
              return (
                <ReplyNode key={uuid} post={child} fullPostMap={fullPostMap} resolvePerson={resolvePerson} setReplyTarget={setReplyTarget} />
              )
            })
          )}
        </div>
      )}

      {/* Shared reply popup */}
      {replyTarget && (
        <ReplyPopup
          headpost={headpost}
          replyTarget={replyTarget}
          resolvePerson={resolvePerson}
          onConfirm={() => setReplyTarget(null)}
          onClose={() => setReplyTarget(null)}
        />
      )}
    </li>
  )
}

function TabConversations() {
  const conversations = useAppStore((s) => s.conversations)
  const fullPostMap = useAppStore((s) => s.fullPostMap)
  const contacts = useAppStore((s) => s.contacts)
  const currentUser = useAppStore((s) => s.session.currentUser)
  const [showDialog, setShowDialog] = useState(false)

  function resolvePerson(email) {
    if (currentUser?.email === email) return currentUser
    return contacts.find((f) => f.email === email) ?? { email, name: email }
  }

  return (
    <div className="tab-content">
      <button
        onClick={() => setShowDialog(true)}
        style={{ fontSize: '0.75em', padding: '0.25em 1em', border: '1px solid green', color: 'green' }}
      >
        Add a new conversation
      </button>
      {conversations.length === 0 ? (
        <p>Please add new conversations</p>
      ) : (
        <p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {conversations.map((uuid) => {
              const headpost = fullPostMap.get(uuid)
              if (!headpost) return null
              return (
                <ConversationRow key={uuid} post={headpost} resolvePerson={resolvePerson} fullPostMap={fullPostMap} currentUser={currentUser} />
              )
            })}
          </ul>
        </p>
      )}
      {showDialog && <AddConversationDialog contacts={contacts} onClose={() => setShowDialog(false)} />}
    </div>
  )
}

export default TabConversations
