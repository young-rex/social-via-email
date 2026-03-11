import { useAppStore } from './dataStore'

function OperationsTab() {
  const session = useAppStore((s) => s.session)

  return (
    <div className="tab-content">
      <p>Logged in as {session.currentUser?.email}</p>
    </div>
  )
}

export default OperationsTab
