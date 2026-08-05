import { useState } from 'react'
import s from '../index.module.css'

const OPTIONS = [
  { key: 'A', label: 'Pillar 1 (Knowledge):', body: "Maria doesn't know which strategies are effective. Re-reading creates a false sense of familiarity; she lacks the conditional knowledge that retrieval practice would serve her better." },
  { key: 'B', label: 'Pillar 2 (Monitoring):', body: "Maria's comprehension monitoring is inaccurate. She cannot detect that her confidence during revision doesn't reflect actual understanding — the classic \"illusion of knowing.\"" },
  { key: 'C', label: 'Pillar 3 (Control):', body: "Maria doesn't adjust her strategies after repeated poor outcomes. Each cycle repeats the same approach — a failure of evaluation and feed-forward." },
  { key: 'D', label: 'All three pillars are implicated:', body: 'The pillars are interdependent. Each failure compounds the others in a self-reinforcing cycle.' },
]

const ANALYSIS = `<strong style="color:var(--navy)">The cascade:</strong> Maria's failure begins with <strong>Pillar 1</strong> — she lacks conditional knowledge that re-reading is less effective than retrieval practice. Because her strategy creates a feeling of familiarity without genuine comprehension, <strong>Pillar 2</strong> fails next: her monitoring is inaccurate and she cannot detect the gap between felt confidence and actual understanding. Finally, <strong>Pillar 3</strong> fails: without accurate monitoring data, she has no basis for adjusting her strategy — so each cycle repeats. This is the <em>cascade effect</em>: a knowledge failure enables a monitoring failure, which prevents regulatory action. In practice, instruction targeting any one pillar alone is unlikely to break the cycle; all three need attention.`

export default function Act4({ onComplete, onClose }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const isBest = selected === 'D' || selected === 'B'

  function optClass(key) {
    if (!revealed) return selected === key ? s.selected : ''
    if (key === 'D' || key === 'B') return s.correctAns
    if (selected === key) return s.wrongAns
    return ''
  }

  return (
    <>
      <div className={s.amHeader}>
        <h3>Apply the Framework: Learner Scenario</h3>
        <span className={s.amStepBadge}>Step 5 of 7</span>
      </div>
      <div className={s.amInstruction}>
        Read the scenario below carefully, then use the three-pillar framework to identify the core metacognitive breakdown. There is a primary answer, but the full explanation is nuanced.
      </div>
      <div className={s.scenarioText}>
        <strong>Maria</strong> is a motivated second-year university student. Before exams, she spends many hours going over her notes — re-reading them, sometimes highlighting key sections. During revision she feels increasingly confident. But she consistently scores lower than she expects. After each exam she is genuinely surprised by her results. Each cycle, she does the same thing again, expecting different outcomes.
      </div>
      <div className={s.radioOptions}>
        {OPTIONS.map(opt => (
          <label
            key={opt.key}
            className={`${s.radioOpt} ${optClass(opt.key)}`}
            onClick={() => !revealed && setSelected(opt.key)}
          >
            <input type="radio" name="sc4" readOnly checked={selected === opt.key} />
            <div className={s.roLabel}><strong>{opt.key} — {opt.label}</strong> {opt.body}</div>
          </label>
        ))}
      </div>
      {revealed && (
        <div
          className={`${s.scenarioFeedback} ${s.show}`}
          style={{
            background: isBest ? '#D1F0EB' : '#FEF3E2',
            borderLeft: `3px solid ${isBest ? '#2A9D8F' : '#E9C46A'}`,
          }}
        >
          <strong style={{ color: 'var(--navy)' }}>
            {selected === 'D' ? '✓ Excellent analysis — this is the most complete answer.' : selected === 'B' ? '✓ Good — Pillar 2 is the most proximal failure, but the full picture is richer.' : "Partially right — here's the full analysis:"}
          </strong>
          <br /><br />
          <span dangerouslySetInnerHTML={{ __html: ANALYSIS }} />
        </div>
      )}
      <div className={s.amFooter}>
        {!revealed ? (
          <>
            <button className={`${s.amBtn} ${s.check}`} onClick={() => selected && setRevealed(true)}>Reveal Analysis</button>
            <button className={`${s.amBtn} ${s.secondary}`} onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            <button className={`${s.amBtn} ${s.primary}`} onClick={() => onComplete({ selected })}>Continue →</button>
            <button className={`${s.amBtn} ${s.secondary}`} onClick={onClose}>Close</button>
          </>
        )}
      </div>
    </>
  )
}
