import { useState, useEffect } from 'react'
import s from './index.module.css'
import CaseDocument from './CaseDocument.jsx'
import ActivityModal from './ActivityModal.jsx'
import ConceptModal from './ConceptModal.jsx'
import WelcomeModal from './WelcomeModal.jsx'
import ReportSubmittedModal from './ReportSubmittedModal.jsx'
import { activities, getActivityStatus, getResponseExcerpt } from './activitiesConfig.js'
import { toolkitConcepts } from './concepts.js'

const NAV_SECTIONS = [
  { id: 'tn-overview',       label: 'Overview' },
  { id: 'tn-specifications', label: 'Specifications' },
  { id: 'tn-data',           label: 'Data' },
  { id: 'tn-design',         label: 'Design' },
  { id: 'tn-experts',        label: 'Experts' },
  { id: 'tn-investigation',  label: 'Findings' },
]

function navTo(id) {
  const el = document.getElementById(id)
  if (!el) return
  // Land the section just below the sticky nav — flush reads as cramped,
  // so a small gap is kept, but not so much that the heading sits partway
  // down the viewport.
  const navH = document.querySelector('nav')?.offsetHeight ?? 44
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navH - 12, behavior: 'smooth' })
}

function ActivitiesTab({ responses, activeActivityId, onOpenActivity }) {
  const [expandedIds, setExpandedIds] = useState(new Set())

  function toggleExpand(id) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <ul className={s.sbList}>
      {activities.map((act, i) => {
        const status = getActivityStatus(act.id, responses)
        const excerpt = getResponseExcerpt(act.id, responses)
        const isExpanded = expandedIds.has(act.id)
        return (
          <li key={act.id} className={`${s.sbItem} ${act.id === activeActivityId ? s.sbItemActive : ''}`}>
            <button
              className={s.sbItemBtn}
              onClick={() => onOpenActivity(act.id)}
              aria-label={`Activity ${i + 1}: ${act.title}, ${status === 'complete' ? 'Complete' : status === 'inprogress' ? 'In progress' : 'Not started'}`}
            >
              <span className={`${s.sbDot} ${status === 'complete' ? s.sbDotComplete : status === 'inprogress' ? s.sbDotProgress : ''}`} aria-hidden="true" />
              <span className={s.sbItemMeta}>
                <span className={s.sbItemLabel}>Activity {i + 1}</span>
                <span className={s.sbItemTitle}>{act.title}</span>
                <span className={`${s.sbStatusText} ${status === 'complete' ? s.sbStatusComplete : status === 'inprogress' ? s.sbStatusProgress : s.sbStatusPending}`}>
                  {status === 'complete' ? 'Complete' : status === 'inprogress' ? 'In progress' : 'Not started'}
                </span>
              </span>
              <span className={s.sbChevron} aria-hidden="true">›</span>
            </button>
            {excerpt && (
              <button className={s.sbExcerpt} onClick={() => toggleExpand(act.id)} aria-expanded={isExpanded} aria-label={isExpanded ? 'Show less' : 'Show more'}>
                <span className={`${s.sbExcerptText} ${isExpanded ? s.sbExcerptExpanded : ''}`}>{excerpt}</span>
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function ConceptsTab({ onOpenConcept }) {
  return (
    <div className={s.sbConceptsWrap}>
      <p className={s.sbConceptsIntro}>Use these concepts as analytical tools when completing activities. They explain the physics you need to analyse and interpret the evidence.</p>
      <ul className={s.sbList}>
        {toolkitConcepts.map(concept => (
          <li key={concept.id}>
            <button className={s.sbConceptBtn} onClick={() => onOpenConcept(concept.id)} aria-label={`Open concept: ${concept.title}`}>
              <span>{concept.title}</span>
              <span className={s.sbChevron} aria-hidden="true">›</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function TacomaNarrowsLab({ backHref }) {
  const [responses, setResponses] = useState({})
  const [activeActivityId, setActiveActivityId] = useState(null)
  const [activeConceptId, setActiveConceptId] = useState(null)
  const [sidebarTab, setSidebarTab] = useState('activities')
  const [activeSection, setActiveSection] = useState('tn-overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Mobile-only nav: the pill row is hidden below 600px in favour of a
  // burger menu that drops this list down from the topbar.
  const [navMenuOpen, setNavMenuOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showReportSubmitted, setShowReportSubmitted] = useState(false)
  // Starts closed — the reader dismisses the briefing first, then opens the
  // case file themselves via the cover page's own "Open Case File" button.
  const [openSections, setOpenSections] = useState(() => new Set())
  // True for one frame right after "Open Case File" — see toggleAllSections.
  const [instantExpand, setInstantExpand] = useState(false)

  useEffect(() => {
    function onScroll() {
      let cur = 'tn-overview'
      NAV_SECTIONS.forEach(({ id }) => {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 120) cur = id
      })
      setActiveSection(cur)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleSave(id, data) {
    if (data === null) {
      setResponses(prev => { const next = { ...prev }; delete next[id]; return next })
      return
    }
    setResponses(prev => ({ ...prev, [id]: data }))
  }

  function handleActivitySubmitted(id) {
    if (id === 'act-6') setShowReportSubmitted(true)
  }

  function viewFindings() {
    setShowReportSubmitted(false)
    scrollToSection('tn-investigation')
  }

  function openActivity(id) {
    setActiveActivityId(id)
  }

  function openConcept(id) {
    setActiveConceptId(id)
  }

  function beginInvestigation() {
    setShowWelcome(false)
  }

  const allSectionsOpen = NAV_SECTIONS.every(sec => openSections.has(sec.id))

  function toggleAllSections() {
    if (allSectionsOpen) {
      setOpenSections(new Set())
      setSidebarOpen(false)
      return
    }
    // Expand every card without its usual 0.45s transition — instantExpand
    // strips it for this one update, so the page reaches its full height in
    // the same paint instead of over the next half-second. A scroll issued
    // while cards are still visually mid-expansion gets clamped to whatever
    // (short) height exists at that moment and doesn't resume once the page
    // grows underneath it a beat later, which is what a fixed delay was
    // working around. One frame later the layout has settled, so the
    // sidebar and the scroll can both fire immediately, together, with no
    // artificial wait — and normal per-card animation is restored right after.
    setInstantExpand(true)
    setOpenSections(new Set(NAV_SECTIONS.map(sec => sec.id)))
    setTimeout(() => {
      setSidebarOpen(true)
      navTo('tn-overview')
      setInstantExpand(false)
    }, 0)
  }

  function toggleSection(id) {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Opens a section (without closing any others already open) and scrolls to
  // it. A section's own tab doesn't shift position when IT opens — only
  // later siblings move — but if it was closed, its .45s grid-row expand
  // transition is still mid-flight while the native smooth scroll runs, and
  // a section growing inside the viewport mid-scroll is exactly what
  // triggers the browser's scroll-anchoring adjustment, landing the scroll
  // somewhere other than intended. instantExpand (see toggleAllSections)
  // sidesteps that by skipping straight to the open height in one paint, so
  // nothing is still resizing once the scroll starts.
  function goToSection(id) {
    setInstantExpand(true)
    setOpenSections(prev => new Set(prev).add(id))
    setTimeout(() => {
      navTo(id)
      setInstantExpand(false)
    }, 0)
  }

  function scrollToSection(id) {
    setActiveActivityId(null)
    setInstantExpand(true)
    setOpenSections(prev => new Set(prev).add(id))
    setTimeout(() => {
      navTo(id)
      setInstantExpand(false)
    }, 0)
  }

  const completedCount = activities.filter(a => getActivityStatus(a.id, responses) === 'complete').length
  const progressPct = Math.round((completedCount / activities.length) * 100)

  return (
    <div className={s.shell}>
      {showWelcome && <WelcomeModal onBegin={beginInvestigation} />}

      <nav className={s.topbar}>
        <div className={s.navLeft}>
          <a href={backHref ?? '/'} className={s.navBack}>← Back to Portfolio</a>
        </div>
        <div className={s.navCenter}>
          {NAV_SECTIONS.map(sec => (
            <button
              key={sec.id}
              className={`${s.navBtn} ${activeSection === sec.id ? s.navBtnActive : ''}`}
              onClick={() => goToSection(sec.id)}
            >
              {sec.label}
            </button>
          ))}
        </div>
        <div className={s.navDropdownWrap}>
          <button
            className={s.navDropdownTrigger}
            onClick={() => setNavMenuOpen(o => !o)}
            aria-expanded={navMenuOpen}
            aria-label="Open section menu"
          >
            ☰
          </button>
          {navMenuOpen && (
            <div className={s.navMenuBackdrop} onClick={() => setNavMenuOpen(false)} />
          )}
          {navMenuOpen && (
            <div className={s.navDropdownMenu}>
              {NAV_SECTIONS.map(sec => (
                <button
                  key={sec.id}
                  className={`${s.navDropdownItem} ${activeSection === sec.id ? s.navDropdownItemActive : ''}`}
                  onClick={() => { goToSection(sec.id); setNavMenuOpen(false) }}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <aside className={`${s.sidebar} ${sidebarOpen ? s.sidebarOpen : ''}`}>
        <button className={s.sidebarClose} onClick={() => setSidebarOpen(false)} aria-label="Close activity guide">×</button>

        <div className={s.sbHeader}>
          <div className={s.sbEyebrow}>Activity Guide</div>
          <div className={s.sbTitle}>The Bridge That Shouldn't Have Failed</div>
          <div className={s.sbSubtitle}>1940-TN-001 · Inquiry Tribunal</div>
          <div className={s.sbProgressRow}>
            {completedCount} of {activities.length} activities complete
            <span className={s.sbProgressTrack}><span className={s.sbProgressFill} style={{ width: `${progressPct}%` }} /></span>
          </div>
        </div>

        <div className={s.sbTabs}>
          <button className={`${s.sbTab} ${sidebarTab === 'activities' ? s.sbTabActive : ''}`} onClick={() => setSidebarTab('activities')}>Activities</button>
          <button className={`${s.sbTab} ${sidebarTab === 'concepts' ? s.sbTabActive : ''}`} onClick={() => setSidebarTab('concepts')}>Concepts</button>
        </div>

        <div className={s.sbBody}>
          {sidebarTab === 'activities'
            ? <ActivitiesTab responses={responses} activeActivityId={activeActivityId} onOpenActivity={openActivity} />
            : <ConceptsTab onOpenConcept={openConcept} />}
        </div>

        <div className={s.sbFooter}>
          {confirmReset ? (
            <div className={s.sbResetConfirm}>
              <span>Clear all responses and start again?</span>
              <div className={s.sbResetBtns}>
                <button onClick={() => setConfirmReset(false)}>Cancel</button>
                <button onClick={() => { setResponses({}); setConfirmReset(false) }}>Start again</button>
              </div>
            </div>
          ) : (
            <button className={s.sbFooterBtn} onClick={() => setConfirmReset(true)}>Start again</button>
          )}
        </div>
      </aside>

      {sidebarOpen && <div className={s.sidebarBackdrop} onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

      <div className={`${s.main} ${sidebarOpen ? s.mainShifted : ''}`}>
        <div className={s.content}>
          <CaseDocument
            responses={responses}
            openSections={openSections}
            onToggleSection={toggleSection}
            allOpen={allSectionsOpen}
            onOpenAll={toggleAllSections}
            instantExpand={instantExpand}
          />
        </div>
      </div>

      {!sidebarOpen && (
        <button className={s.sidebarTrigger} onClick={() => setSidebarOpen(true)}>
          Activities ({completedCount}/{activities.length})
        </button>
      )}

      <ActivityModal
        activityId={activeActivityId}
        responses={responses}
        onSave={handleSave}
        onNavigate={setActiveActivityId}
        onScrollToSection={scrollToSection}
        onOpenConcept={openConcept}
        onClose={() => setActiveActivityId(null)}
        onActivitySubmitted={handleActivitySubmitted}
      />

      <ConceptModal
        conceptId={activeConceptId}
        onNavigate={setActiveConceptId}
        onClose={() => setActiveConceptId(null)}
      />

      {showReportSubmitted && (
        <ReportSubmittedModal onViewFindings={viewFindings} onClose={() => setShowReportSubmitted(false)} />
      )}
    </div>
  )
}
