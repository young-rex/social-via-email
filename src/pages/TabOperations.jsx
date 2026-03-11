import { useEffect } from 'react'
import { useAppStore } from '../data/dataStore'
import { initializeLabels } from '../gmail/gmailUtils'

function formatTime(ms) {
  return new Date(ms).toLocaleTimeString('en-GB')
}

function TabOperations() {
  const clearOpLogs = useAppStore((s) => s.clearOpLogs)
  const opLogs      = useAppStore((s) => s.opLogs)

  useEffect(() => {
    initializeLabels()
  }, [])

  return (
    <div className="tab-content">
      <button onClick={clearOpLogs} style={{ fontSize: '0.75em', padding: '0.25em 1em', border: '1px solid red', color: 'red' }}>Clear logs</button>
      <pre className="operations-log">
        {opLogs.length === 0
          ? '(no logs yet)'
          : opLogs.map((e) => `[${formatTime(e.timestamp)}] ${e.message}`).join('\n')}
      </pre>
    </div>
  )
}

export default TabOperations
