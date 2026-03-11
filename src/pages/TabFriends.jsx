import { useAppStore } from '../data/dataStore'

function TabFriends() {
  const friends = useAppStore((s) => s.friends)

  return (
    <div className="tab-content">
      <button style={{ fontSize: '0.75em', padding: '0.25em 1em', border: '1px solid green', color: 'green' }}>Add a new friend</button>
      <p>{friends.length} friend(s)</p>
    </div>
  )
}

export default TabFriends
