import { useState } from 'react'
import s from '../index.module.css'

const SCENARIOS = [
  {
    text: '"As you read a textbook chapter, you suddenly feel uncertain whether you\'ve actually understood the last few paragraphs — even though your eyes kept moving."',
    answer: 'Metacognitive Experience',
    explanation: "This is a metacognitive experience — a real-time subjective feeling about your current cognitive state. The key is that it's a felt sense arising during the task, not stored knowledge or a deliberate action.",
  },
  {
    text: '"Before beginning an essay, Tom thinks: \'For analytical writing like this, planning an outline first always improves my result.\'"',
    answer: 'Metacognitive Knowledge',
    explanation: "This is metacognitive knowledge — specifically, conditional knowledge about when and why a strategy (outlining) works for a particular kind of task. It's stored, statable, and relatively stable.",
  },
  {
    text: '"Halfway through revision, Leila realises flashcards aren\'t helping for this material and switches to writing practice essays instead."',
    answer: 'Metacognitive Action',
    explanation: "This is a metacognitive action — a deliberate adjustment in response to a monitoring signal. Leila detected that her current strategy wasn't working and made a deliberate choice to change it.",
  },
  {
    text: '"Jasmine decides she wants to understand the concept well enough to explain it from memory — not just recognise it on a test."',
    answer: 'Metacognitive Goal',
    explanation: 'This is a metacognitive goal — the cognitive aim guiding the learning episode. It shapes what Jasmine will monitor and how she will evaluate whether she\'s succeeded.',
  },
]
const OPTIONS = ['Metacognitive Knowledge', 'Metacognitive Experience', 'Metacognitive Goal', 'Metacognitive Action']

export default function Act1({ onComplete, onClose }) {
  const [selections, setSelections] = useState({})
  const [checked, setChecked] = useState(false)

  function select(i, opt) {
    if (checked) return
    setSelections(prev => ({ ...prev, [i]: opt }))
  }

  function check() {
    if (Object.keys(selections).length < SCENARIOS.length) return
    setChecked(true)
  }

  function optClass(i, opt) {
    if (!checked) return selections[i] === opt ? s.selected : ''
    if (opt === SCENARIOS[i].answer) return s.correct
    if (selections[i] === opt && opt !== SCENARIOS[i].answer) return s.wrong
    return ''
  }

  const allCorrect = checked && SCENARIOS.every((sc, i) => selections[i] === sc.answer)

  return (
    <>
      <div className={s.amHeader}>
        <h3>Classify the Scenarios</h3>
        <span className={s.amStepBadge}>Step 2 of 7</span>
      </div>
      <div className={s.amInstruction}>
        Each scenario below illustrates one of Flavell's four metacognitive components. Click the correct component for each scenario, then check your answers.
      </div>
      <div className={s.classifyGrid}>
        {SCENARIOS.map((sc, i) => (
          <div key={i} className={s.classifyItem}>
            <div className={s.ciScenario}>{i + 1}. {sc.text}</div>
            <div className={s.classifyOptions}>
              {OPTIONS.map(opt => (
                <button
                  key={opt}
                  className={`${s.classifyOpt} ${optClass(i, opt)}`}
                  onClick={() => select(i, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
            {checked && selections[i] && (
              <div className={`${s.ciFeedback} ${s.show} ${selections[i] === sc.answer ? s.correctFb : s.wrongFb}`}>
                {selections[i] === sc.answer ? '✓ Correct — ' : '✗ Not quite — '}{sc.explanation}
              </div>
            )}
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
            <button className={`${s.amBtn} ${s.primary}`} onClick={() => onComplete({ selections, allCorrect })}>Continue →</button>
            <button className={`${s.amBtn} ${s.secondary}`} onClick={onClose}>Close</button>
          </>
        )}
      </div>
    </>
  )
}
