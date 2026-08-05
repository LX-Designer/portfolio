import s from './index.module.css'
import Act0 from './activities/Act0.jsx'
import Act1 from './activities/Act1.jsx'
import Act2 from './activities/Act2.jsx'
import Act3 from './activities/Act3.jsx'
import Act4 from './activities/Act4.jsx'
import Act5 from './activities/Act5.jsx'
import Act6 from './activities/Act6.jsx'

const ACTIVITIES = [Act0, Act1, Act2, Act3, Act4, Act5, Act6]

export default function ActivityModal({ stepIndex, onComplete, onClose }) {
  if (stepIndex === null || stepIndex === undefined) return null

  const Activity = ACTIVITIES[stepIndex]
  if (!Activity) return null

  return (
    <div className={`${s.activityModal} ${s.visible}`} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={s.amBox}>
        <Activity onComplete={onComplete} onClose={onClose} />
      </div>
    </div>
  )
}
