import s from './index.module.css'

export default function StarterChips({ starters = [], onInsert }) {
  if (!starters.length) return null
  return (
    <div className={s.scSection}>
      <div className={s.scLabel}>Sentence starters: click to insert</div>
      <div className={s.scChips}>
        {starters.map(starter => (
          <button key={starter} type="button" className={s.scChip} onClick={() => onInsert(starter)}>
            {starter}
          </button>
        ))}
      </div>
    </div>
  )
}
