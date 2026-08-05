import { useState } from 'react'
import s from '../index.module.css'

const ITEMS = [
  { text: 'Knowing that you concentrate better in the morning than at night', answer: 'K', expl: 'Knowledge of cognition — specifically declarative knowledge about yourself as a learner.' },
  { text: 'Noticing mid-task that your mind has wandered and deliberately refocusing', answer: 'R', expl: 'Regulation of cognition — specifically monitoring (detecting drift) followed by control (refocusing).' },
  { text: 'Knowing that concept maps help you connect ideas more than re-reading does', answer: 'K', expl: 'Knowledge of cognition — conditional knowledge about which strategy works best for a particular cognitive goal.' },
  { text: "Re-reading a paragraph when you realise you didn't absorb it", answer: 'R', expl: "Regulation of cognition — this is \"debugging\" in Brown's terms: detecting a comprehension failure and acting to fix it." },
  { text: 'Knowing that exams in this subject require application of concepts, not just recall', answer: 'K', expl: "Knowledge of cognition — conditional/procedural knowledge about the nature of the cognitive task." },
  { text: 'Reviewing your work before submitting to check for gaps', answer: 'R', expl: "Regulation of cognition — specifically evaluation, the final phase of Brown's regulatory process." },
]

export default function Act2({ onComplete, onClose }) {
  const [selections, setSelections] = useState({})
  const [checked, setChecked] = useState(false)

  function pick(i, val) {
    if (checked) return
    setSelections(prev => ({ ...prev, [i]: val }))
  }

  function check() {
    if (Object.keys(selections).length < ITEMS.length) return
    setChecked(true)
  }

  function btnClass(i, val) {
    const base = `${s.sortBtn} ${val === 'K' ? s.K : s.R}`
    if (!checked) return selections[i] === val ? `${base} ${s.selected}` : base
    if (val === ITEMS[i].answer) return `${base} ${s.correctPick}`
    if (selections[i] === val) return `${base} ${s.wrongPick}`
    return base
  }

  return (
    <>
      <div className={s.amHeader}>
        <h3>Sort: Knowledge or Regulation?</h3>
        <span className={s.amStepBadge}>Step 3 of 7</span>
      </div>
      <div className={s.amInstruction}>
        Brown (1987) distinguished two functions of metacognition: <strong>Knowledge</strong> (what you know about your cognition) and <strong>Regulation</strong> (how you manage your cognition in real time). Sort each item below.
      </div>
      <div className={s.sortGrid}>
        {ITEMS.map((item, i) => (
          <div key={i} className={s.sortItem}>
            <div>
              <div className={s.siText}>{i + 1}. {item.text}</div>
              {checked && selections[i] && (
                <div className={s.siFeedback} style={{ display: 'block', color: selections[i] === item.answer ? '#2A9D8F' : '#E76F51', marginTop: 6, fontSize: 12 }}>
                  {selections[i] === item.answer ? '✓ ' : '✗ '}{item.expl}
                </div>
              )}
            </div>
            <div className={s.sortBtns}>
              <button className={btnClass(i, 'K')} onClick={() => pick(i, 'K')}>K</button>
              <button className={btnClass(i, 'R')} onClick={() => pick(i, 'R')}>R</button>
            </div>
          </div>
        ))}
      </div>
      <div className={s.amFooter}>
        {!checked ? (
          <>
            <button className={`${s.amBtn} ${s.check}`} onClick={check}>Check Answers</button>
            <button className={`${s.amBtn} ${s.secondary}`} onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            <button className={`${s.amBtn} ${s.primary}`} onClick={() => onComplete({ selections })}>Continue →</button>
            <button className={`${s.amBtn} ${s.secondary}`} onClick={onClose}>Close</button>
          </>
        )}
      </div>
    </>
  )
}
