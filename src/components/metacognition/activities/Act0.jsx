import { useState } from 'react'
import s from '../index.module.css'

const QUESTIONS = [
  'Before starting a learning task, I plan which strategies to use',
  "While learning, I notice when I genuinely don't understand something",
  "I adjust my approach when my current strategy isn't working",
  'I have an accurate picture of which learning strategies work best for me',
  'After a learning task, I reflect on what went well and what to change',
]

export default function Act0({ onComplete, onClose }) {
  const [values, setValues] = useState([3, 3, 3, 3, 3])

  function handleChange(i, v) {
    const next = [...values]
    next[i] = v
    setValues(next)
  }

  return (
    <>
      <div className={s.amHeader}>
        <h3>Baseline Self-Assessment</h3>
        <span className={s.amStepBadge}>Step 1 of 7</span>
      </div>
      <div className={s.amInstruction}>
        Rate each statement honestly based on your <strong>current practice</strong> — not your ideal. There are no right answers. This baseline will be shown at the end of the journey so you can compare your thinking.
      </div>
      <div className={s.sliderGroup}>
        {QUESTIONS.map((q, i) => (
          <div key={i} className={s.sliderItem}>
            <label>
              {q} <span className={s.sliderVal}>{values[i]}</span>/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={values[i]}
              onChange={e => handleChange(i, parseInt(e.target.value))}
            />
            <div className={s.sliderLabels}>
              <span>Rarely</span><span>Sometimes</span><span>Consistently</span>
            </div>
          </div>
        ))}
      </div>
      <div className={s.amFooter}>
        <button className={`${s.amBtn} ${s.primary}`} onClick={() => onComplete({ values })}>
          Save & Continue →
        </button>
      </div>
    </>
  )
}
