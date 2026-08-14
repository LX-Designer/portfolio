import s from './index.module.css'

export default function ConceptCard({ concept }) {
  return (
    <div className={s.ccCard}>
      <p className={s.ccTagline}>{concept.tagline}</p>
      <p className={s.ccIntro}>{concept.intro}</p>

      {concept.diagram && (
        <img src={concept.diagram} alt={concept.diagramAlt} className={s.ccDiagram} />
      )}

      {concept.sections.map(section => (
        <div key={section.heading} className={s.ccSection}>
          <h3 className={s.ccSectionHeading}>{section.heading}</h3>
          <p className={s.ccSectionBody}>{section.body}</p>
        </div>
      ))}

      <div className={s.ccKeyTerms}>
        {concept.keyTerms.map(({ term, definition }) => (
          <div key={term} className={s.ccKeyTerm}>
            <span className={s.ccTerm}>{term}</span>
            <span className={s.ccDefinition}>{definition}</span>
          </div>
        ))}
      </div>

      <div className={s.ccApplyTo}>
        <span className={s.ccApplyLabel}>When to use this concept</span>
        <p>{concept.applyTo}</p>
      </div>
    </div>
  )
}
