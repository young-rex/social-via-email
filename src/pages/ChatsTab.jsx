import { useAppStore } from '../data/dataStore'

function ChatsTab() {
  const chats = useAppStore((s) => s.chats)

  return (
    <div className="tab-content">
      <button style={{ fontSize: '0.75em', padding: '0.25em 1em', border: '1px solid green', color: 'green' }}>Add a new chat</button>
      <p>{chats.length} chat(s)</p>
    </div>
  )
}

export default ChatsTab
