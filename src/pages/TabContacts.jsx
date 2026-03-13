import { useState } from 'react'
import { useAppStore } from '../data/dataStore'
import { uiAddContact } from '../actions/contactActions'

function AddContactDialog({ onClose }) {
  const contacts = useAppStore((s) => s.contacts)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  function handleConfirm() {
    if (!emailRegex.test(email)) {
      setError('Invalid email format.')
      return
    }
    if (contacts.some((f) => f.email === email)) {
      setError('This person is already your contact.')
      return
    }
    setError('')

    uiAddContact(email)

    setSuccess(true)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', color: '#111', padding: '1.5em 2em', borderRadius: '8px', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '0.75em' }}>
        {success ? (
          <>
            <p style={{ margin: 0 }}>Request email has been sent.</p>
            <button onClick={onClose} style={{ alignSelf: 'flex-end' }}>Close</button>
          </>
        ) : (
          <>
            <label htmlFor="contact-email" style={{ fontWeight: 600 }}>Provide a contact's email</label>
            <input
              id="contact-email"
              type="text"
              value={email}
              onChange={(e) => { setEmail(e.target.value.toLowerCase()); setError('') }}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{ padding: '0.4em', fontSize: '1em' }}
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

function TabContacts() {
  const contacts = useAppStore((s) => s.contacts)
  const [showDialog, setShowDialog] = useState(false)

  return (
    <div className="tab-content">
      <button
        onClick={() => setShowDialog(true)}
        style={{ fontSize: '0.75em', padding: '0.25em 1em', border: '1px solid green', color: 'green' }}
      >
        Add a new contact
      </button>
      {contacts.length === 0 ? (
        <p>Please add new contacts</p>
      ) : (
        <p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {contacts.map((c) => (
            <li key={c.email} className="social-user-info" style={{ marginBottom: '0.5em' }}>
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
            </li>
          ))}
        </ul>
        </p>
      )}
      {showDialog && <AddContactDialog onClose={() => setShowDialog(false)} />}
    </div>
  )
}

export default TabContacts
