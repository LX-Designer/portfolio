import { useState } from 'react'
import s from '../index.module.css'

const OPTIONS = [
  { key: '1', label: 'Stage 1 — Activate & Name:', body: 'Surface what students already do when they study. Give their habits vocabulary. Make the implicit explicit before introducing anything new.' },
  { key: '2', label: 'Stage 2 — Model:', body: 'Start with think-alouds. Show students how you work through a problem, including noticing confusion and adjusting strategies.' },
  { key: '3', label: 'Stage 3 — Scaffold & Prompt:', body: 'Give students a planning template and exit tickets immediately. Structure their thinking from lesson one.' },
  { key: '4', label: 'Stage 4 — Collaborate & Discuss:', body: 'Start with peer review using metacognitive rubrics — students learn best from each other.' },
]

const MSGS = {
  '1': '✓ Stage 1 is the right starting point.',
  '2': "Stage 2 can work, but there's a risk.",
  '3': 'Stage 3 is premature here.',
  '4': 'Stage 4 is too advanced for a starting point.',
}

export default function Act5({ onComplete, onClose }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  function optClass(key) {
    if (!revealed) return selected === key ? s.selected : ''
    if (key === '1') return s.correctAns
    if (selected === key) return s.wrongAns
    return ''
  }

  return (
    <>
      <div className={s.amHeader}>
        <h3>Diagnose the Teaching Situation</h3>
        <span className={s.amStepBadge}>Step 6 of 7</span>
      </div>
      <div className={s.amInstruction}>
        Apply the five-stage model to this teaching scenario. Choose the stage that would be most impactful to start with, and why.
      </div>
      <div className={s.scenarioText}>
        You teach a <strong>Year 10 class</strong>. Students are capable and motivated, but have never been asked to think about how they learn. Most rely on re-reading and hope. You want to begin systematically developing their metacognitive skills. You have one lesson per week to focus on this.
      </div>
      <div className={s.radioOptions}>
        {OPTIONS.map(opt => (
          <label
            key={opt.key}
            className={`${s.radioOpt} ${optClass(opt.key)}`}
            onClick={() => !revealed && setSelected(opt.key)}
          >
            <input type="radio" name="sc5" readOnly checked={selected === opt.key} />
            <div className={s.roLabel}><strong>{opt.label}</strong> {opt.body}</div>
          </label>
        ))}
      </div>
      {revealed && (
        <div
          className={`${s.scenarioFeedback} ${s.show}`}
          style={{
            background: selected === '1' ? '#D1F0EB' : '#FEF3E2',
            borderLeft: `3px solid ${selected === '1' ? '#2A9D8F' : '#E9C46A'}`,
          }}
        >
          <strong style={{ color: 'var(--navy)' }}>{MSGS[selected]}</strong>
          <br /><br />
          <strong>Why Stage 1 comes first:</strong> Students who have never been asked to think about their own learning lack the vocabulary and conceptual framework to make sense of modelled think-alouds (Stage 2) or to use planning templates metacognitively (Stage 3). Without a shared language for what monitoring, planning, and evaluation mean, those tools become procedural routines rather than metacognitive exercises. Stage 1's purpose is to surface the implicit — to help students see that they already have cognitive habits — and give those habits names. Once that foundation exists, Stage 2's modelling lands differently: students can connect what they observe to concepts they now have words for.
          <br /><br />
          <strong>Note on Stage 2:</strong> Many effective teachers instinctively start with think-alouds. This can work if the think-aloud is immediately followed by Stage 1-style discussion ("What did you notice about how I was thinking?"). The key is that activation and naming must happen at some point early in the sequence — whether before or immediately after the first model.
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
