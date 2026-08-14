import s from './index.module.css'
import ConceptCard from './ConceptCard.jsx'
import { toolkitConcepts } from './concepts.js'

export default function ConceptModal({ conceptId, onNavigate, onClose }) {
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

        <div className={s.tnModalBody}>
          <ConceptCard concept={concept} />
        </div>

        <div className={s.tnModalFooter}>
          <button className={s.tnNavBtn} disabled={!prev} onClick={() => prev && onNavigate(prev.id)}>
            ← {prev ? prev.title : 'Previous'}
          </button>
          <button className={s.tnNavBtn} disabled={!next} onClick={() => next && onNavigate(next.id)}>
            {next ? next.title : 'Next'} →
          </button>
        </div>
      </div>
    </div>
  )
}
