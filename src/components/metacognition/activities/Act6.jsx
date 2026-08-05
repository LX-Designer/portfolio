import { useState } from 'react'
import s from '../index.module.css'

export default function Act6({ onComplete, onClose }) {
  const [fields, setFields] = useState({ pillar: '', practice: '', stage: '', technique: '', barrier: '', success: '' })
  const [previewing, setPreviewing] = useState(false)

  function set(key, val) {
    setFields(prev => ({ ...prev, [key]: val }))
    if (previewing) setPreviewing(false)
  }

  function preview() {
    if (Object.values(fields).some(v => !v.trim())) {
      alert('Please complete all fields before previewing.')
      return
    }
    setPreviewing(true)
  }

  return (
    <>
      <div className={s.amHeader}>
        <h3>Build Your Personal Action Plan</h3>
        <span className={s.amStepBadge}>Step 7 of 7</span>
      </div>
      <div className={s.amInstruction}>
        You've worked through the full framework. Now translate it into a concrete plan for your own practice. Your responses will appear in your Learning Summary at the end.
      </div>
      <div className={s.textInputGroup}>
        <div className={s.tiItem}>
          <label>Which metacognitive pillar do you most want to develop in your learners?</label>
          <select value={fields.pillar} onChange={e => set('pillar', e.target.value)}>
            <option value="">— Select —</option>
            <option>Pillar 1: Metacognitive Knowledge — helping learners understand their own strengths, strategies, and when to use them</option>
            <option>Pillar 2: Metacognitive Monitoring — helping learners track their understanding accurately in real time</option>
            <option>Pillar 3: Metacognitive Control — helping learners adjust strategies and evaluate outcomes adaptively</option>
            <option>All three pillars equally — I want to work across the full framework</option>
          </select>
        </div>
        <div className={s.tiItem}>
          <label>How would you describe your current practice?</label>
          <select value={fields.practice} onChange={e => set('practice', e.target.value)}>
            <option value="">— Select —</option>
            <option>Just beginning — metacognitive instruction is new to me</option>
            <option>Emerging — I occasionally prompt reflection, but it's not systematic</option>
            <option>Developing — I have some consistent practices, but want to deepen them</option>
            <option>Established — metacognition is a regular part of my teaching, but I want to refine</option>
          </select>
        </div>
        <div className={s.tiItem}>
          <label>Which stage of the five-stage model would be most impactful to focus on in the next term?</label>
          <select value={fields.stage} onChange={e => set('stage', e.target.value)}>
            <option value="">— Select —</option>
            <option>Stage 1: Activate &amp; Name</option>
            <option>Stage 2: Model</option>
            <option>Stage 3: Scaffold &amp; Prompt</option>
            <option>Stage 4: Collaborate &amp; Discuss</option>
            <option>Stage 5: Fade &amp; Transfer</option>
          </select>
        </div>
        <div className={s.tiItem}>
          <label>Name one specific technique you will try in the next two weeks:</label>
          <input type="text" value={fields.technique} onChange={e => set('technique', e.target.value)} placeholder="e.g. a 3-minute planning prompt before each independent task…" />
        </div>
        <div className={s.tiItem}>
          <label>What is the most likely barrier to trying this?</label>
          <input type="text" value={fields.barrier} onChange={e => set('barrier', e.target.value)} placeholder="e.g. time pressure, student resistance, assessment focus…" />
        </div>
        <div className={s.tiItem}>
          <label>How will you know it's working? What will you look for in your learners?</label>
          <textarea value={fields.success} onChange={e => set('success', e.target.value)} placeholder="e.g. students begin to notice and name when they're confused rather than proceeding silently…" />
        </div>
      </div>
      {previewing && (
        <div className={`${s.planOutput} ${s.show}`}>
          <h3>📋 Your Action Plan</h3>
          {[
            ['Focus pillar', fields.pillar],
            ['Current practice', fields.practice],
            ['Next stage to develop', fields.stage],
            ['Technique to trial', fields.technique],
            ['Anticipated barrier', fields.barrier],
            ['Success indicator', fields.success],
          ].map(([label, val]) => (
            <div key={label} className={s.planRow}>
              <div className={s.prLabel}>{label}</div>
              <div className={s.prValue}>{val}</div>
            </div>
          ))}
        </div>
      )}
      <div className={s.amFooter}>
        {!previewing ? (
          <button className={`${s.amBtn} ${s.check}`} onClick={preview}>Preview My Plan</button>
        ) : (
          <button className={`${s.amBtn} ${s.primary}`} onClick={() => onComplete(fields)}>Save &amp; Finish →</button>
        )}
        <button className={`${s.amBtn} ${s.secondary}`} onClick={onClose}>Close</button>
      </div>
    </>
  )
}
