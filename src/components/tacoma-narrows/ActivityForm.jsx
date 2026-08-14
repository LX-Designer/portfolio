import { useState, useRef } from 'react'
import s from './index.module.css'
import StarterChips from './StarterChips.jsx'

// Every activity in this lab is a single free-text response (hypothesis,
// analysis, or the final report) gated behind a Submit button, differing
// only in field key, prompt copy, and label text — so one form component
// driven by the activity config replaces what would otherwise be six
// near-identical files.
export default function ActivityForm({ activity, initialAnswers, onSubmit, onSave, locked = false, lockedHint = null }) {
  const key = activity.responseKey
  const [value, setValue] = useState(initialAnswers?.[key] ?? '')
  const [submitLocked, setSubmitLocked] = useState(!!initialAnswers?._submitted)
  const [everSubmitted, setEverSubmitted] = useState(!!initialAnswers?._submitted)
  const textRef = useRef(null)

  const ready = value.trim().length > 0

  function appendStarter(starter) {
    setValue(prev => prev ? `${prev}\n\n${starter}` : starter)
    setSubmitLocked(false)
    setTimeout(() => textRef.current?.focus(), 50)
  }

  function handleSubmit() {
    if (!ready || locked) return
    onSubmit({ [key]: value.trim() })
    setSubmitLocked(true)
    setEverSubmitted(true)
  }

  const label = submitLocked
    ? 'Submitted ✓'
    : everSubmitted && activity.resubmitLabel
      ? activity.resubmitLabel
      : activity.submitLabel

  return (
    <>
      {activity.extraInstruction && (
        <div className={s.instruction}>
          <span className={s.instructionLabel}>Your task: {activity.title}</span>
          {activity.extraInstruction.lead}
          <ol>
            {activity.extraInstruction.items.map(item => <li key={item}>{item}</li>)}
          </ol>
        </div>
      )}

      {activity.inputLabel && <label className={s.inputLabel}>{activity.inputLabel}</label>}
      <StarterChips starters={activity.sentenceStarters ?? []} onInsert={appendStarter} />
      <textarea
        ref={textRef}
        className={`${s.textarea} ${activity.large ? s.textareaLg : ''}`}
        rows={activity.rows ?? 6}
        placeholder={activity.placeholder}
        value={value}
        onChange={e => { setValue(e.target.value); setSubmitLocked(false) }}
        onBlur={() => onSave?.({ [key]: value.trim() })}
      />

      <div className={s.actions}>
        {locked && lockedHint && <span className={s.actionHint}>{lockedHint}</span>}
        <button
          className={`${s.btn} ${activity.danger ? s.btnDanger : s.btnPrimary}`}
          onClick={handleSubmit}
          type="button"
          disabled={!ready || submitLocked || locked}
        >
          {label}
        </button>
      </div>
    </>
  )
}
