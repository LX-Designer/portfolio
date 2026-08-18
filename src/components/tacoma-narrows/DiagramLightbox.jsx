import { useState } from 'react'
import s from './index.module.css'

// Wraps a diagram <img> with a tap/click-to-enlarge affordance. The lightbox
// itself carries no pan/zoom logic — these are vector SVGs, so opening them
// large (rather than the ~340px they render at inline on mobile) already
// solves the readability problem, and the page's viewport meta doesn't
// disable pinch-zoom, so a reader who wants to go further can use native
// pinch-zoom on the enlarged image for free.
export default function DiagramLightbox({ src, alt, caption, variant }) {
  const [open, setOpen] = useState(false)
  const figureClass = variant === 'concept' ? s.ccDiagramFigure : s.diagram

  return (
    <figure className={figureClass}>
      <button type="button" className={s.diagramTrigger} onClick={() => setOpen(true)} aria-label={`Enlarge diagram: ${alt}`}>
        <img src={src} alt={alt} />
        <span className={s.diagramZoomHint} aria-hidden="true">⤢</span>
      </button>
      {caption && <figcaption className={s.diagramCaption}>{caption}</figcaption>}

      {open && (
        <div className={s.lightbox} onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <button type="button" className={s.lightboxClose} onClick={() => setOpen(false)} aria-label="Close enlarged diagram">×</button>
          <img className={s.lightboxImg} src={src} alt={alt} />
          {caption && <div className={s.lightboxCaption}>{caption}</div>}
        </div>
      )}
    </figure>
  )
}
