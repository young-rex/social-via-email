import { useEffect } from 'react'
import { useAppStore } from '../data/dataStore'
import { initializeLabels, loadEmailToState, scanIncomingEmails } from '../gmail/gmailUtils'

function formatTime(ms) {
  return new Date(ms).toLocaleTimeString('en-GB')
}

function TabLogs() {
  const clearLogs = useAppStore((s) => s.clearLogs)
  const logs        = useAppStore((s) => s.logs)

  useEffect(() => {
    const run = async () => {
      await initializeLabels()
      await loadEmailToState()
      await scanIncomingEmails()
    }
    run()
  }, [])

  return (
    <div className="tab-content">
      <button onClick={clearLogs} style={{ fontSize: '0.75em', padding: '0.25em 1em', border: '1px solid red', color: 'red' }}>Clear logs</button>
      <pre className="operations-log">
        {logs.length === 0
          ? '(no logs yet)'
          : logs.map((e) => `[${formatTime(e.timestamp)}] ${e.message}`).join('\n')}
      </pre>
    </div>
  )
}

export default TabLogs
