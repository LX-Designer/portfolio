import { useRef } from 'react'
import s from './index.module.css'
import Act0 from './activities/Act0.jsx'
import Act1 from './activities/Act1.jsx'
import Act2 from './activities/Act2.jsx'
import Act3 from './activities/Act3.jsx'
import Act4 from './activities/Act4.jsx'
import Act5 from './activities/Act5.jsx'
import Act6 from './activities/Act6.jsx'

const ACTIVITIES = [Act0, Act1, Act2, Act3, Act4, Act5, Act6]

const STEPS = [
  'Baseline Self-Assessment',
  "Flavell's Four Components",
  'Knowledge vs. Regulation',
  'SDL Theorists',
  'The Evidence & The Framework',
  'Five-Stage Model',
  'Personal Action Plan',
]

const INSTRUCTIONS = [
  "Before reading further, rate your current practice honestly. This creates a baseline you'll return to at the end.",
  'Read Section 1: Flavell\'s Four Components. Select each card to expand detail. Then do the activity.',
  'Switch to the "Knowledge of Cognition" and "Regulation of Cognition" tabs in Section 1. Then sort the examples.',
  'Read Section 2 and explore all three theorist tabs. Then match each theorist to their key insight.',
  'Read Sections 3 and 4. Explore the three pillars. Then apply the framework to a real learner scenario.',
  'Read Section 5 and expand all five stages. Then diagnose which stage to start with in a teaching scenario.',
  "You've built the knowledge. Now synthesise it into a concrete plan for your own practice.",
]

export default function JourneyBar({
  visible, step, activityDone, onActivity, onPrev, onNext, onExit, onGoToStep,
  collapsed, onToggleCollapse, onActivityComplete,
}) {
  // Drag-to-expand/collapse on the peek handle: a drag is recognised as
  // soon as it crosses a small threshold in the "make sense" direction
  // (up while collapsed, down while expanded) — it doesn't wait for the
  // finger to lift, so the panel starts sliding the moment the gesture is
  // clear, same as a native bottom sheet. Pointer capture keeps the whole
  // gesture targeted at this button even once the finger moves outside its
  // (fairly short) bounds. A plain tap still works via the click handler;
  // the `fired` flag stops it from firing a second time right after a drag
  // already toggled the state.
  const dragRef = useRef({ startY: 0, fired: false })

  function handlePeekPointerDown(e) {
    dragRef.current = { startY: e.clientY, fired: false }
    // Can legitimately throw (e.g. the pointer's already gone by the time
    // this runs) — capture is a nice-to-have for tracking the drag outside
    // the button's bounds, not something the gesture depends on.
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
  }
  function handlePeekPointerMove(e) {
    const drag = dragRef.current
    if (drag.fired) return
    const DRAG_THRESHOLD = 10
    const deltaY = e.clientY - drag.startY
    if (collapsed && deltaY < -DRAG_THRESHOLD) {
      drag.fired = true
      onToggleCollapse()
    } else if (!collapsed && deltaY > DRAG_THRESHOLD) {
      drag.fired = true
      onToggleCollapse()
    }
  }
  function handlePeekClick() {
    if (dragRef.current.fired) {
      dragRef.current.fired = false
      return
    }
    onToggleCollapse()
  }

  if (!visible || step < 0 || step >= STEPS.length) return null

  const isDone = activityDone.includes(step)
  const isFirst = step <= 0
  const isLast = step >= STEPS.length - 1
  const Activity = ACTIVITIES[step]

  return (
    <>
      {/* Desktop / tablet: classic fixed left sidebar. Hidden below 600px in
          favour of the mobile activity panel below. */}
      <div className={`${s.journeyBar} ${s.visible}`}>
        <button className={s.jbExit} onClick={onExit} aria-label="Exit guided journey">✕</button>

        <div className={s.jbProgress}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${s.jbDot} ${i < step ? s.done : i === step ? s.current : ''}`}
              onClick={() => onGoToStep(i)}
              aria-label={`Go to step ${i + 1}: ${STEPS[i]}`}
            />
          ))}
        </div>

        <div className={s.jbStepInfo}>
          <div className={s.jbStepLabel}>Step {step + 1} of {STEPS.length}</div>
          <div className={s.jbStepTitle}>{STEPS[step]}</div>
          <div className={s.jbInstruction}>{INSTRUCTIONS[step]}</div>
        </div>

        <div className={s.jbBtns}>
          <button
            className={`${s.jbBtn} ${s.primary}`}
            style={{ background: isDone ? '#2A9D8F' : '#E9C46A' }}
            onClick={onActivity}
          >
            {isDone ? '✓ Revisit Activity' : '▶ Activity'}
          </button>
          <div className={s.jbNavBtns}>
            <button className={`${s.jbBtn} ${s.secondary}`} onClick={onPrev} disabled={isFirst}>
              ← Previous
            </button>
            <button className={`${s.jbBtn} ${s.secondary}`} onClick={onNext}>
              {isLast ? 'Finish ✓' : 'Next step →'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile only: replaces the sidebar entirely below 600px. Always
          mounted (rather than swapped) so it can slide between a peek strip
          and the full activity, growing upward from the bottom edge like a
          native bottom sheet, instead of popping between two states. */}
      <div className={`${s.maPanel} ${collapsed ? '' : s.expanded}`}>
        <div className={s.maPeek}>
          <div className={s.maPeekRow}>
            <button
              className={s.maPeekLabel}
              onPointerDown={handlePeekPointerDown}
              onPointerMove={handlePeekPointerMove}
              onClick={handlePeekClick}
              aria-expanded={!collapsed}
              aria-label={collapsed ? 'Expand activity panel' : 'Collapse activity panel'}
            >
              <span className={`${s.jbGrabber} ${collapsed ? '' : s.jbGrabberOpen}`} />
              <span className={s.maHeaderLabel}>Step {step + 1} of {STEPS.length}: {STEPS[step]}</span>
            </button>
            <button className={s.maExit} onClick={onExit} aria-label="Exit guided journey">✕</button>
          </div>
        </div>
        <div className={s.maContent} aria-hidden={collapsed}>
          <div className={s.maNavRow}>
            <button className={s.maNavBtn} onClick={onPrev} disabled={isFirst}>
              ← Previous
            </button>
            <button className={s.maNavBtn} onClick={onNext}>
              {isLast ? 'Finish ✓' : 'Next →'}
            </button>
          </div>
          <div className={s.maBody}>
            {Activity && <Activity onComplete={onActivityComplete} onClose={onToggleCollapse} />}
          </div>
        </div>
      </div>
    </>
  )
}
