import s from './index.module.css'

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
  'Read Section 1 — Flavell\'s Four Components. Click each card to expand detail. Then do the activity.',
  'Switch to the "Knowledge of Cognition" and "Regulation of Cognition" tabs in Section 1. Then sort the examples.',
  'Read Section 2 — explore all three theorist tabs. Then match each theorist to their key insight.',
  'Read Sections 3 and 4. Explore the three pillars. Then apply the framework to a real learner scenario.',
  'Read Section 5 — expand all five stages. Then diagnose which stage to start with in a teaching scenario.',
  "You've built the knowledge. Now synthesise it into a concrete plan for your own practice.",
]

export default function JourneyBar({ visible, step, activityDone, onActivity, onNext, onExit }) {
  if (!visible || step < 0 || step >= STEPS.length) return null

  const isDone = activityDone.includes(step)
  const isLast = step >= STEPS.length - 1

  return (
    <div className={`${s.journeyBar} ${s.visible}`}>
      <div className={s.jbTop}>
        <div className={s.jbProgress}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`${s.jbDot} ${i < step ? s.done : i === step ? s.current : ''}`}
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
          <button className={`${s.jbBtn} ${s.secondary}`} onClick={onNext}>
            {isLast ? 'Finish ✓' : 'Next step →'}
          </button>
          <button className={`${s.jbBtn} ${s.exit}`} onClick={onExit}>✕ Exit</button>
        </div>
      </div>
    </div>
  )
}
