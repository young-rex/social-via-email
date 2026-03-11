import { useAppStore } from './dataStore'

function ChatsTab() {
  const chats = useAppStore((s) => s.chats)

  return (
    <div className="tab-content">
      <p>{chats.length} chat(s)</p>
    </div>
  )
}

export default ChatsTab
