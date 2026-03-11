import { useAppStore } from './dataStore'

function FriendsTab() {
  const friends = useAppStore((s) => s.friends)

  return (
    <div className="tab-content">
      <p>{friends.length} friend(s)</p>
    </div>
  )
}

export default FriendsTab
