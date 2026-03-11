import { useAppStore } from '../data/dataStore'

function TimelinesTab() {
  const timelines = useAppStore((s) => s.timelines)

  return (
    <div className="tab-content">
      <button style={{ fontSize: '0.75em', padding: '0.25em 1em', border: '1px solid green', color: 'green' }}>Add a new thread</button>
      <p>{timelines.length} timeline(s)</p>
    </div>
  )
}

export default TimelinesTab
