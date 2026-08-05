import { useState } from 'react'
import s from '../index.module.css'

const ITEMS = [
  {
    quote: 'Individuals take the initiative — with or without the help of others — in diagnosing their learning needs, formulating goals, and evaluating their own outcomes.',
    answer: 'Knowles',
    expl: "This is Knowles' (1975) foundational definition of self-directed learning, emphasising learner initiative and the full cycle from diagnosis to evaluation.",
  },
  {
    quote: 'Self-monitoring — checking whether strategies are working — is the cognitive-metacognitive core that gives self-directed learning its internal compass.',
    answer: 'Garrison',
    expl: 'Garrison (1997) positioned self-monitoring as the defining internal dimension of SDL, bridging metacognition and self-management.',
  },
  {
    quote: 'Self-regulation is a cyclical process: what you do in the forethought phase shapes your performance, and what you learn in the reflection phase reshapes your forethought.',
    answer: 'Zimmerman',
    expl: "Zimmerman's (2002) cyclical model makes the feed-forward loop central: each reflection phase directly informs the next forethought phase, so the learner improves across episodes.",
  },
  {
    quote: 'Metacognition involves both what you know about your cognitive processes and how you use that knowledge to regulate those processes in action.',
    answer: 'Brown',
    expl: "This captures Brown's (1987) essential distinction between knowledge of cognition (stable, stored) and regulation of cognition (dynamic, situation-dependent) — the foundation of most modern metacognition frameworks.",
  },
]
const THEORISTS = ['Flavell', 'Brown', 'Knowles', 'Garrison', 'Zimmerman']

export default function Act3({ onComplete, onClose }) {
  const [selections, setSelections] = useState({})
  const [checked, setChecked] = useState(false)

  function check() {
    setChecked(true)
  }

  function selectClass(i) {
    if (!checked) return s.matchSelect
    return `${s.matchSelect} ${selections[i] === ITEMS[i].answer ? s.correct : s.wrong}`
  }

  const score = checked ? ITEMS.filter((m, i) => selections[i] === m.answer).length : 0

  return (
    <>
      <div className={s.amHeader}>
        <h3>Match the Theorist</h3>
        <span className={s.amStepBadge}>Step 4 of 7</span>
      </div>
      <div className={s.amInstruction}>
        Each quote captures a key theoretical insight. Match each quote to the correct theorist. Use the tabs in Section 2 if you want to check before guessing.
      </div>
      <div className={s.matchGrid}>
        {ITEMS.map((m, i) => (
          <div key={i} className={s.matchItem}>
            <div className={s.matchQuote}>"{m.quote}"</div>
            <select
              className={selectClass(i)}
              value={selections[i] || ''}
              onChange={e => !checked && setSelections(prev => ({ ...prev, [i]: e.target.value }))}
            >
              <option value="">— Select theorist —</option>
              {THEORISTS.map(t => <option key={t}>{t}</option>)}
            </select>
            {checked && selections[i] && (
              <div
                className={`${s.matchFeedback} ${s.show}`}
                style={{
                  background: selections[i] === m.answer ? '#D1F0EB' : '#FDECEA',
                  color: selections[i] === m.answer ? '#1a5e56' : '#8B2A1A',
                }}
              >
                {selections[i] === m.answer ? `✓ Correct — ` : `✗ This is ${m.answer} — `}{m.expl}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={s.amFooter}>
        {!checked ? (
          <>
            <button className={`${s.amBtn} ${s.check}`} onClick={check}>Check Matches</button>
            <button className={`${s.amBtn} ${s.secondary}`} onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            <span className={s.scoreNote}>Score: {score}/{ITEMS.length}</span>
            <button className={`${s.amBtn} ${s.primary}`} onClick={() => onComplete({ selections, score })}>Continue →</button>
          </>
        )}
      </div>
    </>
  )
}
