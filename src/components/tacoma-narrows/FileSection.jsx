import s from './index.module.css'

// One section of the case file, rendered as a manila-folder-style tab that
// expands/collapses. Content always stays mounted (never conditionally
// rendered) so the CSS grid-row transition has something to animate against
// and so scrolling to a closed section still lands in the right place.
export default function FileSection({ id, code, title, italic, isOpen, onToggle, children }) {
  return (
    <div id={id} className={`${s.fileCard} ${isOpen ? s.fileCardOpen : ''}`}>
      <button
        type="button"
        className={s.fileTab}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className={s.fileTabCode}>{code}</span>
        <span className={`${s.fileTabTitle} ${italic ? s.fileTabTitleItalic : ''}`}>{title}</span>
        <span className={s.fileTabIcon} aria-hidden="true">{isOpen ? '−' : '+'}</span>
      </button>

      <div className={s.fileContent}>
        <div className={s.fileContentClip}>
          <div className={s.fileContentBody}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
