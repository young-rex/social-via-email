import { useAppStore } from '../data/dataStore'

function TimelinesTab() {
  const timelines = useAppStore((s) => s.timelines)

  return (
    <div className="tab-content">
      <p>{timelines.length} timeline(s)</p>
    </div>
  )
}

export default TimelinesTab
