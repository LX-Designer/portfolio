import { useState, useEffect, useRef } from 'react'
import s from './index.module.css'
import ActivityForm from './ActivityForm.jsx'
import { activities, getActivityStatus } from './activitiesConfig.js'

export default function ActivityModal({
  activityId,
  responses,
  onSave,
  onNavigate,
  onScrollToSection,
  onOpenConcept,
  onClose,
  onActivitySubmitted,
}) {
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [activityId])
  // ActivityForm keeps its own draft/submitted state locally and only reads
  // initialAnswers on mount — clearing a response updates `responses` in the
  // parent, but without a key change the form never remounts to pick that
  // up, so the textarea and "Submitted" state silently stay stale. Bumping
  // this into the key forces a fresh mount whenever a clear happens.
  const [clearKey, setClearKey] = useState(0)

  if (activityId === null) return null
  const actIndex = activities.findIndex(a => a.id === activityId)
  const activity = activities[actIndex]
  if (!activity) return null

  const prevActivity = actIndex > 0 ? activities[actIndex - 1] : null
  const nextActivity = actIndex < activities.length - 1 ? activities[actIndex + 1] : null

  function navigate(id) {
    setShowClearConfirm(false)
    onNavigate(id)
  }

  function clearResponse() {
    setShowClearConfirm(false)
    onSave(activity.id, null)
    setClearKey(k => k + 1)
  }

  const missingPrereqIds = (activity.requiresActivities ?? []).filter(id => getActivityStatus(id, responses) !== 'complete')
  const isLocked = missingPrereqIds.length > 0
  const lockedHint = isLocked
    ? (() => {
        const nums = missingPrereqIds.map(id => activities.findIndex(a => a.id === id) + 1)
        const label = nums.length === 1
          ? `Activity ${nums[0]}`
          : `Activities ${nums.slice(0, -1).join(', ')} and ${nums[nums.length - 1]}`
        return `Complete ${label} before you can submit your tribunal report.`
      })()
    : null

  return (
    <div className={`${s.tnModal} ${s.visible}`} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={s.tnModalBox}>
        <div className={s.tnModalHeader}>
          <div className={s.tnModalSubtitle}>Activity {actIndex + 1} · {activity.thinkingMove}</div>
          <h2 className={s.tnModalTitle}>{activity.title}</h2>
          <button className={s.tnModalClose} onClick={onClose} aria-label="Close activity">×</button>
        </div>

        <div className={s.tnModalBody} ref={bodyRef}>
          <div className={s.tnModalFull}>
            {activity.prompt && <p className={s.tnPrompt}>{activity.prompt}</p>}

            {activity.evidenceSections?.length > 0 && (
              <div className={s.linkGroup}>
                <div className={s.linkGroupLabel}>Go to evidence</div>
                <div className={s.linkBtns}>
                  {activity.evidenceSections.map(({ id, label }) => (
                    <button key={id} className={s.linkBtn} onClick={() => { onClose(); onScrollToSection(id) }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activity.conceptLinks?.length > 0 && (
              <div className={s.linkGroup}>
                <div className={s.linkGroupLabel}>Relevant Concepts</div>
                <div className={s.linkBtns}>
                  {activity.conceptLinks.map(({ id, title }) => (
                    <button key={id} className={s.linkBtn} onClick={() => onOpenConcept(id)}>
                      {title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <ActivityForm
              key={`${activity.id}-${clearKey}`}
              activity={activity}
              initialAnswers={responses[activity.id] ?? {}}
              locked={isLocked}
              lockedHint={lockedHint}
              onSubmit={data => {
                onSave(activity.id, { ...data, _submitted: true })
                onActivitySubmitted?.(activity.id)
              }}
              onSave={data => {
                const existing = responses[activity.id]
                const preserved = existing?._submitted ? { ...data, _submitted: true } : data
                onSave(activity.id, preserved)
              }}
            />
          </div>
        </div>

        <div className={s.tnModalFooter}>
          <div className={s.tnNavRow}>
            <button className={s.tnNavBtn} disabled={!prevActivity} onClick={() => prevActivity && navigate(prevActivity.id)}>
              <span aria-hidden="true">← </span>
              <span className={s.tnNavLabelFull}>{prevActivity ? `Activity ${actIndex}` : 'Previous'}</span>
              <span className={s.tnNavLabelShort}>Previous</span>
            </button>

            {nextActivity ? (
              <button className={s.tnNavBtn} onClick={() => navigate(nextActivity.id)}>
                <span className={s.tnNavLabelFull}>Activity {actIndex + 2}</span>
                <span className={s.tnNavLabelShort}>Next</span>
                <span aria-hidden="true"> →</span>
              </button>
            ) : (
              <button className={s.tnNavBtn} onClick={onClose}>Close</button>
            )}
          </div>

          <div className={s.tnClearRow}>
            {showClearConfirm ? (
              <div className={s.clearConfirm}>
                <span>Clear this response?</span>
                <button onClick={() => setShowClearConfirm(false)}>Cancel</button>
                <button onClick={clearResponse}>Clear</button>
              </div>
            ) : (
              <button className={s.tnClearBtn} onClick={() => setShowClearConfirm(true)}>Clear this response</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
