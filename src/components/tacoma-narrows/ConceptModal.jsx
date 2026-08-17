import { useEffect, useRef } from 'react'
import s from './index.module.css'
import ConceptCard from './ConceptCard.jsx'
import { toolkitConcepts } from './concepts.js'

export default function ConceptModal({ conceptId, onNavigate, onClose }) {
  const bodyRef = useRef(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [conceptId])

  if (!conceptId) return null
  const index = toolkitConcepts.findIndex(c => c.id === conceptId)
  const concept = toolkitConcepts[index]
  if (!concept) return null

  const prev = index > 0 ? toolkitConcepts[index - 1] : null
  const next = index < toolkitConcepts.length - 1 ? toolkitConcepts[index + 1] : null

  return (
    <div className={`${s.tnModal} ${s.visible}`} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`${s.tnModalBox} ${s.tnConceptBox}`}>
        <div className={s.tnModalHeader}>
          <div className={s.tnModalSubtitle}>Concept {index + 1} of {toolkitConcepts.length}</div>
          <h2 className={s.tnModalTitle}>{concept.title}</h2>
          <button className={s.tnModalClose} onClick={onClose} aria-label="Close concept">×</button>
        </div>

        <div className={s.tnModalBody} ref={bodyRef}>
          <ConceptCard concept={concept} />
        </div>

        <div className={s.tnModalFooter}>
          <div className={s.tnNavRow}>
            <button className={s.tnNavBtn} disabled={!prev} onClick={() => prev && onNavigate(prev.id)}>
              <span aria-hidden="true">← </span>
              <span className={s.tnNavLabelFull}>{prev ? prev.title : 'Previous'}</span>
              <span className={s.tnNavLabelShort}>Previous</span>
            </button>
            <button className={s.tnNavBtn} disabled={!next} onClick={() => next && onNavigate(next.id)}>
              <span className={s.tnNavLabelFull}>{next ? next.title : 'Next'}</span>
              <span className={s.tnNavLabelShort}>Next</span>
              <span aria-hidden="true"> →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
