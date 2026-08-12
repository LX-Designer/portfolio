// Ported from asset-library's src/assets/metacognition-sdl/index.jsx.
// In InquiryLabs this asset receives onResponse/onComplete/savedResponses/onReset
// from a Supabase-backed AssetWrapper. There's no backend here, so this port
// stands those in with local component state — everything else is unchanged.
import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react'
import { Chart } from 'chart.js/auto'
import s from './index.module.css'
import WelcomeModal from './WelcomeModal.jsx'
import JourneyBar from './JourneyBar.jsx'
import ActivityModal from './ActivityModal.jsx'
import ExitConfirmModal from './ExitConfirmModal.jsx'

// ── Section nav config ────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: 'how-to-use', label: 'How to Use' },
  { id: 'overview',   label: 'Overview' },
  { id: 'metacognition', label: 'Metacognition' },
  { id: 'sdl',        label: 'SDL Theory' },
  { id: 'evidence',   label: 'Evidence' },
  { id: 'framework',  label: 'Framework' },
  { id: 'cultivating', label: 'Cultivating Skills' },
  { id: 'implications', label: 'Implications' },
  { id: 'references', label: 'References' },
]

const NUM_STEPS = 7

function navTo(id) {
  const el = document.getElementById(id)
  if (!el) return
  const navH = document.querySelector('nav')?.offsetHeight ?? 48
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navH - 16, behavior: 'smooth' })
}

// ── Chart ─────────────────────────────────────────────────────────────────────
function VarianceChart() {
  const ref = useRef(null)
  useEffect(() => {
    const ctx = ref.current.getContext('2d')
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Metacognition (unique)', 'Intelligence (unique)', 'Shared (both)'],
        datasets: [{ data: [17, 10, 20], backgroundColor: ['#2E75B6', '#2A9D8F', '#E9C46A'], borderRadius: 6, borderSkipped: false }],
      },
      options: {
        indexAxis: 'y', responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => `${c.parsed.x}% of learning variance` } },
        },
        scales: {
          x: { max: 30, grid: { color: '#EBF5FB' }, ticks: { callback: v => v + '%', color: '#5A6A82', font: { size: 12 } }, title: { display: true, text: '% of variance in learning performance', color: '#5A6A82', font: { size: 12 } } },
          y: { grid: { display: false }, ticks: { color: '#1A2332', font: { size: 13 } } },
        },
      },
    })
    return () => chart.destroy()
  }, [])
  return <canvas ref={ref} height={120} />
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = '', duration = 1200 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      let step = 0; const steps = 60
      const timer = setInterval(() => {
        step++
        setVal(Math.min(Math.round(target / steps * step), target))
        if (step >= steps) clearInterval(timer)
      }, duration / steps)
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])
  return <span ref={ref}>{val}{suffix}</span>
}

// ── Expandable card ───────────────────────────────────────────────────────────
function ExpandCard({ tag, icon, title, body, detail, noHover }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`${s.card} ${open ? s.active : ''}`} onClick={() => setOpen(o => !o)}>
      {tag && <div className={s.cardTag}>{tag}</div>}
      <div className={s.cardIcon}>{icon}</div>
      <div className={s.cardTitle}>{title}</div>
      <div className={s.cardBody}>{body}</div>
      <div className={s.cardDetail}>{detail}</div>
    </div>
  )
}

// Tracks two independent height baselines for a group of click-to-expand
// items sharing the site's .active open/closed toggle convention — one for
// closed items, one for open ones — via the CSS custom properties --eh-h
// and --eh-h-open on the returned ref's element (consumed by that item
// type's own min-height rules). A single shared min-height would either
// drag closed siblings up to match an opened item, leaving empty space in
// them, or leave several simultaneously-open items at their own uneven
// natural heights. A MutationObserver re-syncs whenever any item's open/
// closed class actually changes, since that's exactly when items move
// between the two cohorts; also re-syncs on window resize (text rewrapping).
function useEqualHeightGroup(itemClass) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    function sync() {
      el.style.setProperty('--eh-h', 'auto')
      el.style.setProperty('--eh-h-open', 'auto')
      const items = el.querySelectorAll(`.${itemClass}`)
      let maxClosed = 0, maxOpen = 0
      items.forEach((it) => {
        const h = it.getBoundingClientRect().height
        if (it.classList.contains(s.active)) maxOpen = Math.max(maxOpen, h)
        else maxClosed = Math.max(maxClosed, h)
      })
      el.style.setProperty('--eh-h', maxClosed ? `${Math.ceil(maxClosed)}px` : 'auto')
      el.style.setProperty('--eh-h-open', maxOpen ? `${Math.ceil(maxOpen)}px` : 'auto')
    }
    sync()
    window.addEventListener('resize', sync)
    const observer = new MutationObserver(sync)
    observer.observe(el, { attributes: true, attributeFilter: ['class'], subtree: true })
    return () => {
      window.removeEventListener('resize', sync)
      observer.disconnect()
    }
  }, [])

  return ref
}

function ExpandCardGrid({ colsClass, children }) {
  const ref = useEqualHeightGroup(s.card)
  return (
    <div ref={ref} className={`${s.cardGrid} ${s.expandable} ${colsClass}`}>
      {children}
    </div>
  )
}

// ── Tab group ─────────────────────────────────────────────────────────────────
function TabGroup({ tabs, defaultTab }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0].id)
  return (
    <>
      <div className={s.tabs}>
        {tabs.map(t => (
          <button key={t.id} className={`${s.tabBtn} ${active === t.id ? s.active : ''}`} onClick={() => setActive(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map(t => (
        <div key={t.id} className={`${s.tabContent} ${active === t.id ? s.active : ''}`}>
          {t.content}
        </div>
      ))}
    </>
  )
}

// ── SDL cycle ─────────────────────────────────────────────────────────────────
function SDLCycle() {
  const [phase, setPhase] = useState(0)
  const phases = [
    { title: '🎯 Forethought Phase', body: <>Goal-setting, strategic planning, and motivational activation before a task. The metacognitive pillar active here is <strong>Metacognitive Knowledge</strong>.</> },
    { title: '⚙️ Performance Phase', body: <>Execution of strategies with self-monitoring and self-control. The metacognitive pillar active here is <strong>Metacognitive Monitoring</strong>.</> },
    { title: '🔁 Self-Reflection Phase', body: <>Post-task self-evaluation and adaptive inference for future performance. The metacognitive pillar active here is <strong>Metacognitive Control &amp; Regulation</strong>.</> },
  ]
  return (
    <div className={s.cycleWrap}>
      <div className={s.cycleSvgBox}>
        <svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 260 }}>
          <circle cx="130" cy="130" r="110" fill="#F5F9FD" stroke="#C8DCF0" strokeWidth="2" />
          <path d="M130 25 A105 105 0 0 1 235 130" fill="none" stroke="#C8DCF0" strokeWidth="2" markerEnd="url(#arr)" />
          <path d="M235 130 A105 105 0 0 1 130 235" fill="none" stroke="#C8DCF0" strokeWidth="2" markerEnd="url(#arr)" />
          <path d="M130 235 A105 105 0 0 1 25 130" fill="none" stroke="#C8DCF0" strokeWidth="2" markerEnd="url(#arr)" />
          <path d="M25 130 A105 105 0 0 1 130 25" fill="none" stroke="#C8DCF0" strokeWidth="2" markerEnd="url(#arr)" />
          <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#2E75B6" /></marker></defs>
          <circle cx="130" cy="40" r="32" fill={phase === 0 ? '#1F4E79' : '#4a7ba7'} style={{ cursor: 'pointer' }} onClick={() => setPhase(0)} />
          <text x="130" y="36" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Fore-</text>
          <text x="130" y="48" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">thought</text>
          <circle cx="220" cy="130" r="32" fill={phase === 1 ? '#2E75B6' : '#6a9fd4'} style={{ cursor: 'pointer' }} onClick={() => setPhase(1)} />
          <text x="220" y="126" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Perfor-</text>
          <text x="220" y="138" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">mance</text>
          <circle cx="130" cy="220" r="32" fill={phase === 2 ? '#2A9D8F' : '#55b8ac'} style={{ cursor: 'pointer' }} onClick={() => setPhase(2)} />
          <text x="130" y="216" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Self-</text>
          <text x="130" y="228" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Reflection</text>
          <text x="130" y="124" textAnchor="middle" fill="#1F4E79" fontSize="11" fontWeight="700">SDL</text>
          <text x="130" y="138" textAnchor="middle" fill="#1F4E79" fontSize="11" fontWeight="700">Cycle</text>
        </svg>
      </div>
      <div className={s.cycleInfo}>
        {phases.map((p, i) => (
          <div key={i} className={`${s.phaseCard} ${phase === i ? s.active : ''}`} onClick={() => setPhase(i)}>
            <div className={s.pcTitle}>{p.title}</div>
            <div className={s.pcBody}>{p.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Stages ────────────────────────────────────────────────────────────────────
function Stages() {
  const [open, setOpen] = useState([])
  const toggle = i => setOpen(cur => cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i])
  const stages = [
    { title: 'Activate & Name', sub: 'Making thinking visible ↓', body: <>Introduce metacognitive vocabulary; surface implicit thinking habits; make learning processes visible and discussable. Most learners have metacognitive activity but lack the language to reflect on it deliberately.<div className={s.stageTools}><strong>Practical tools</strong>Concept mapping of "how I learn" · Pre-task think-alouds · Explicit labelling of strategies in class discussion</div></> },
    { title: 'Model', sub: 'Showing thinking in action ↓', body: <>Educator narrates metacognitive processes during authentic tasks. Error-making, confusion, and self-correction are made explicit. A model who proceeds smoothly to a perfect solution teaches little about the regulatory processes learning actually requires.<div className={s.stageTools}><strong>Practical tools</strong>Live think-alouds · Annotated worked examples with metacognitive commentary · Modelling planning and monitoring with shared texts</div></> },
    { title: 'Scaffold & Prompt', sub: 'Guided responsibility ↓', body: <><strong>Critical design principle:</strong> scaffolds must be progressively faded. A planning template used every session becomes a routine rather than a metacognitive exercise. Structured prompts guide self-questioning at each phase of the SDL cycle.<div className={s.stageTools}><strong>Practical tools</strong>Planning prompts · Monitoring exit tickets · Evaluation journals · KWL charts · Success criteria co-construction</div></> },
    { title: 'Collaborate & Discuss', sub: 'Social metacognition ↓', body: <>Learners externalise metacognitive processes through peer dialogue. Verbalisation consolidates awareness; social comparison expands conditional knowledge. Reciprocal teaching shows moderate-to-large effects on comprehension.<div className={s.stageTools}><strong>Practical tools</strong>Reciprocal teaching · Peer review with metacognitive rubrics · 5-minute metacognitive debriefs · Collaborative self-assessment</div></> },
    { title: 'Fade & Transfer', sub: 'Independent application ↓', body: <>Scaffolds progressively removed; learners apply strategies independently across novel domains. Transfer is rarely spontaneous; it must be deliberately cultivated by drawing attention to structural similarities between tasks in different contexts.<div className={s.stageTools}><strong>Practical tools</strong>Independent learning projects · Cross-subject reflection · Portfolio self-evaluation · Transfer challenges · Learner-led learning conferences</div></> },
  ]
  return (
    <div className={s.stages}>
      {stages.map((st, i) => (
        <div key={i} className={`${s.stage} ${open.includes(i) ? s.active : ''}`} onClick={() => toggle(i)}>
          <div className={s.stageHead}>
            <div className={s.stageNum}>{i + 1}</div>
            <div className={s.stageTitle}>{st.title}</div>
            <div className={s.stageSub}>{st.sub}</div>
          </div>
          <div className={s.stageBody}>{st.body}</div>
        </div>
      ))}
    </div>
  )
}

// ── Accordion ─────────────────────────────────────────────────────────────────
function Accordion({ items }) {
  const [open, setOpen] = useState([])
  const toggle = i => setOpen(cur => cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i])
  return (
    <div className={s.accordion}>
      {items.map((item, i) => (
        <div key={i} className={`${s.accItem} ${open.includes(i) ? s.open : ''}`}>
          <button className={s.accHead} onClick={() => toggle(i)}>
            {item.title} <span className={s.accArrow}>▼</span>
          </button>
          <div className={s.accBody}>{item.body}</div>
        </div>
      ))}
    </div>
  )
}

// ── Pillars ───────────────────────────────────────────────────────────────────
function Pillars() {
  const [open, setOpen] = useState([])
  const toggle = i => setOpen(cur => cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i])
  const ref = useEqualHeightGroup(s.pillar)
  const pillars = [
    { color: '#1F4E79', icon: '🧩', num: 'Pillar 1', title: 'Metacognitive Knowledge', body: 'The "Knowing" dimension. Stored beliefs about oneself, tasks, and strategies, enabling accurate self-appraisal before beginning any learning episode.', detail: <><strong>Components:</strong> Declarative, Procedural, Conditional.<br /><br /><strong>SDL function:</strong> Enables accurate diagnosis of learning needs, realistic goal-setting, and informed strategy selection in the planning phase.<br /><br /><strong>Critical point:</strong> Conditional knowledge (knowing when and why a strategy is appropriate) is the most neglected dimension in instruction and the most important for flexible, transferable learning.</> },
    { color: '#2E75B6', icon: '📡', num: 'Pillar 2', title: 'Metacognitive Monitoring', body: 'The "Awareness" dimension. Real-time checking of comprehension and progress against learning goals throughout execution.', detail: <><strong>Processes:</strong> Comprehension monitoring, feeling-of-knowing judgements, progress tracking, detection of strategy failure.<br /><br /><strong>SDL function:</strong> Closes the feedback loop that makes SDL adaptive. Without monitoring, learners continue unproductive approaches because they receive no internal signal that something is wrong.<br /><br /><strong>Key finding:</strong> Online monitoring (r = .53) is twice as predictive as self-reported metacognitive awareness (r = .23).</> },
    { color: '#2A9D8F', icon: '🔄', num: 'Pillar 3', title: 'Metacognitive Control', body: 'The "Adapting" dimension. Deliberate adjustment in response to monitoring, plus post-task evaluation and adaptive attribution of outcomes.', detail: <><strong>Processes:</strong> Strategy switching, resource reallocation, post-task evaluation, causal attribution.<br /><br /><strong>SDL function:</strong> Generates the feed-forward loop. Evaluation of one episode revises the metacognitive knowledge base for the next. Attribution is key: "my strategy failed" (adaptive) vs "I'm not capable" (maladaptive).<br /><br /><strong>SDL impact:</strong> Control is where metacognition shapes long-term learning trajectory.</> },
  ]
  return (
    <div ref={ref} className={s.pillars}>
      {pillars.map((p, i) => (
        <div key={i} className={`${s.pillar} ${open.includes(i) ? s.active : ''}`} onClick={() => toggle(i)}>
          <div className={s.pillarHead} style={{ background: p.color }}>
            <div className={s.phIcon}>{p.icon}</div>
            <div className={s.phNum}>{p.num}</div>
            <div className={s.phTitle}>{p.title}</div>
          </div>
          <div className={s.pillarBody}>{p.body}</div>
          <div className={s.pillarDetail}>{p.detail}</div>
        </div>
      ))}
    </div>
  )
}

// ── Synthesis section ─────────────────────────────────────────────────────────
function SynthesisSection({ baseline, actionPlan, isComplete, onStartJourney }) {
  const blLabels = ['Plan strategies', 'Notice gaps', 'Adjust approach', 'Know best strategies', 'Reflect after tasks']

  function printSummary() {
    window.print()
  }
  function emailSummary() {
    const ap = actionPlan
    const blText = baseline.length ? blLabels.map((l, i) => `  ${l}: ${baseline[i]}/5`).join('\n') : '  (not recorded)'
    const body = [
      'METACOGNITION & SELF-DIRECTED LEARNING',
      'Personal Learning Summary', '---', '',
      'BASELINE SELF-ASSESSMENT', blText, '',
      'PERSONAL ACTION PLAN',
      `  Pillar focus: ${ap.pillar || 'N/A'}`,
      `  Current practice: ${ap.practice || 'N/A'}`,
      `  Next stage: ${ap.stage || 'N/A'}`,
      `  Technique to trial: ${ap.technique || 'N/A'}`,
      `  Anticipated barrier: ${ap.barrier || 'N/A'}`,
      `  Success indicator: ${ap.success || 'N/A'}`,
    ].join('\n')
    window.location.href = `mailto:?subject=${encodeURIComponent('My Metacognition & SDL Learning Summary')}&body=${encodeURIComponent(body)}`
  }

  return (
    <section id="synthesis" className={s.synthesis}>
      {!isComplete ? (
        <div className={s.synHiddenMsg}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🧭</div>
          <strong style={{ color: '#E9C46A', fontSize: 15 }}>Your Learning Summary</strong>
          <br /><br />
          Complete the Guided Journey to unlock your personal synthesis, including your baseline self-assessment and your personal action plan.
          <br /><br />
          <button onClick={onStartJourney} style={{ background: '#E9C46A', color: '#1a1a1a', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
            Start Guided Journey →
          </button>
        </div>
      ) : (
        <>
          <div className={s.printHeader}>
            <div style={{ fontWeight: 800, fontSize: '14pt', color: '#1F4E79' }}>Metacognition &amp; Self-Directed Learning</div>
            <div style={{ fontSize: '11pt', color: '#5A6A82', marginTop: 4 }}>Personal Learning Summary</div>
          </div>
          <h2>Your Learning Summary</h2>
          <p className={s.synSub}>Generated from your Guided Journey responses</p>
          <div className={s.synGrid}>
            <div className={s.synCard} style={{ gridColumn: '1 / -1' }}>
              <h4>📊 Your Baseline: Metacognitive Self-Assessment</h4>
              <div className={s.baselineBars}>
                {blLabels.map((l, i) => (
                  <div key={i} className={s.bbItem}>
                    <div className={s.bbLabel}>{l} <strong style={{ color: '#E9C46A' }}>{baseline[i] ?? 3}/5</strong></div>
                    <div className={s.bbBar}><div className={s.bbFill} style={{ width: `${((baseline[i] ?? 3) / 5) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, opacity: .7, marginTop: 10 }}>Revisit this resource in a few weeks and retake the baseline to see how your awareness has shifted.</p>
            </div>
            {actionPlan.pillar && (
              <div className={s.synCard} style={{ gridColumn: '1 / -1' }}>
                <h4>📋 Your Action Plan</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div><span style={{ opacity: .7 }}>Pillar focus: </span><strong>{actionPlan.pillar}</strong></div>
                  <div><span style={{ opacity: .7 }}>Current practice: </span><strong>{actionPlan.practice}</strong></div>
                  <div><span style={{ opacity: .7 }}>Next stage to develop: </span><strong>{actionPlan.stage}</strong></div>
                  <div><span style={{ opacity: .7 }}>Technique to trial: </span><strong>{actionPlan.technique}</strong></div>
                  <div><span style={{ opacity: .7 }}>Anticipated barrier: </span>{actionPlan.barrier}</div>
                  <div><span style={{ opacity: .7 }}>Success indicator: </span>{actionPlan.success}</div>
                </div>
              </div>
            )}
          </div>
          <div className={s.synMetaNote}>
            <strong>Notice:</strong> The journey you just completed modelled the five-stage instructional approach described in this review. It activated your prior knowledge (Step 0), built concepts progressively (Steps 1–3), applied them to scenarios (Steps 4–5), and synthesised into personal action (Step 6). This is what it feels like to learn metacognitively, and it is what you can create for your own learners.
          </div>
          <p className={s.synResetRow} style={{ marginTop: 20, textAlign: 'center' }}>
            <button onClick={() => window.location.reload()} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.45)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
              Reset progress and start again
            </button>
          </p>
          <div className={s.synExportBtns}>
            <button className={`${s.synExportBtn} ${s.solid}`} onClick={printSummary}>⬇ Download summary (PDF)</button>
            <button className={`${s.synExportBtn} ${s.outline}`} onClick={emailSummary}>✉ Email myself a copy</button>
          </div>
        </>
      )}
    </section>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MetacognitionLab({ backHref }) {
  // Stands in for the Supabase-backed AssetWrapper this asset expects in InquiryLabs.
  const [savedResponses, setSavedResponses] = useState({})
  async function onResponse(id, data) {
    setSavedResponses(cur => ({ ...cur, [id]: data }))
  }
  async function onComplete() {}
  async function onReset() {
    setSavedResponses({})
  }

  // Derived from savedResponses (updates in real-time via AssetWrapper)
  const activityDone = useMemo(
    () => Array.from({ length: NUM_STEPS }, (_, i) => savedResponses[`activity-${i}`] ? i : null).filter(i => i !== null),
    [savedResponses]
  )
  const baseline    = useMemo(() => savedResponses['activity-0']?.values ?? [], [savedResponses])
  const actionPlan  = useMemo(() => {
    const resp = savedResponses['activity-6']
    if (!resp) return {}
    const { done, ...fields } = resp
    return fields
  }, [savedResponses])
  const isJourneyComplete = Object.keys(actionPlan).length > 0

  // UI state
  const [showWelcome, setShowWelcome]     = useState(true)
  const [mode, setMode]                   = useState('journey')
  const [step, setStep]                   = useState(0)
  const [journeyActive, setJourneyActive] = useState(false)
  const [activeActivity, setActiveActivity] = useState(null)
  const [activeSection, setActiveSection] = useState('overview')
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  // Scrollspy
  useEffect(() => {
    const ids = NAV_SECTIONS.map(s => s.id)
    function onScroll() {
      let cur = 'overview'
      ids.forEach(id => {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 100) cur = id
      })
      setActiveSection(cur)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Journey handlers ────────────────────────────────────────────────────────
  function startJourney() {
    setShowWelcome(false)
    setStep(0)
    setJourneyActive(true)
    navTo('overview')
  }

  function startMode() {
    setShowWelcome(false)
    if (mode !== 'journey') return
    if (isJourneyComplete) {
      navTo('synthesis')
      return
    }
    if (activityDone.length > 0) {
      const resumeStep = activityDone[activityDone.length - 1] + 1
      setStep(Math.min(resumeStep, NUM_STEPS - 1))
      setJourneyActive(true)
      navTo(stepSection(Math.min(resumeStep, NUM_STEPS - 1)))
    } else {
      startJourney()
    }
  }

  function stepSection(i) {
    const map = ['overview', 'metacognition', 'browns-distinction', 'sdl', 'evidence', 'cultivating', 'synthesis']
    return map[i] ?? 'overview'
  }

  function nextStep() {
    if (step >= NUM_STEPS - 1) {
      setJourneyActive(false)
      navTo('synthesis')
      onComplete(null, { stepsCompleted: activityDone.length })
      return
    }
    const next = step + 1
    setStep(next)
    navTo(stepSection(next))
  }

  function prevStep() {
    if (step <= 0) return
    const prev = step - 1
    setStep(prev)
    navTo(stepSection(prev))
  }

  function exitJourney() {
    setShowExitConfirm(true)
  }

  function confirmExit() {
    setShowExitConfirm(false)
    setJourneyActive(false)
  }

  function cancelExit() {
    setShowExitConfirm(false)
  }

  async function handleActivityComplete(data) {
    await onResponse(`activity-${step}`, { done: true, ...data })
    setActiveActivity(null)
    // Auto-advance to next step after last activity
    if (step >= NUM_STEPS - 1) {
      setJourneyActive(false)
      navTo('synthesis')
      onComplete(null, { stepsCompleted: NUM_STEPS })
    }
  }

  async function handleReset() {
    await onReset()
    setShowWelcome(true)
    setStep(0)
    setJourneyActive(false)
    setActiveActivity(null)
  }

  const hasProgress = activityDone.length > 0 || baseline.length > 0

  // ── Metacognition section tab content ───────────────────────────────────────
  const metaTabs = [
    {
      id: 'know', label: 'Knowledge of Cognition', content: (
        <>
          <ExpandCardGrid colsClass={s.cols3}>
            <ExpandCard icon="📖" title="Declarative Knowledge" body={'"What I know about how I learn."'} detail={<>Knowledge about oneself as a learner and factors influencing performance. Relatively stable and statable. Example: "I know I learn better when I space my revision."</>} />
            <ExpandCard icon="⚙️" title="Procedural Knowledge" body={'"How to execute strategies."'} detail="Knowing how to carry out strategies step-by-step. A learner may know summarisation helps (declarative) without knowing how to write an effective summary (procedural). Both are needed." />
            <ExpandCard icon="🗺️" title="Conditional Knowledge" body={'"When and why to use a strategy."'} detail="Often the most neglected dimension in instruction. Knowing that mind-mapping works for connecting ideas but is less suited to sequential procedures. This is what makes strategy use flexible and adaptive." />
          </ExpandCardGrid>
          <div className={s.callout}><strong>Key insight:</strong> Possessing metacognitive knowledge does not guarantee it will be applied. Conditional knowledge (knowing when and why) is hardest to develop and most commonly under-taught.</div>
        </>
      ),
    },
    {
      id: 'reg', label: 'Regulation of Cognition', content: (
        <>
          <ExpandCardGrid colsClass={s.cols3}>
            <ExpandCard icon="🗓️" title="Planning" body="Deciding what to do and in what sequence before beginning." detail="Selecting strategies, allocating time, setting sub-goals, activating prior knowledge. Planning quality predicts both learning efficiency and depth." />
            <ExpandCard icon="📡" title="Monitoring" body="Real-time checking of whether current strategies are working." detail={'Comprehension monitoring, progress tracking, feeling-of-knowing judgements. Poor monitoring is the root of the "illusion of knowing": learners who cannot detect their own confusion cannot remedy it.'} />
            <ExpandCard icon="🔄" title="Evaluating & Debugging" body="Assessing outcomes and correcting errors in thinking." detail={`"Debugging" (Brown's term) refers to identifying and fixing comprehension breakdowns. Post-task evaluation feeds forward into future planning, making each cycle more accurate than the last.`} />
          </ExpandCardGrid>
          <div className={s.callout}><strong>Key insight:</strong> Regulation of cognition is more dynamic and situation-dependent than metacognitive knowledge. A learner may know the right strategy but fail to monitor whether it is working.</div>
        </>
      ),
    },
    {
      id: 'mai', label: 'Schraw & Dennison MAI (1994)', content: (
        <>
          <div className={`${s.callout} ${s.gold}`}><strong>Schraw &amp; Dennison's Metacognitive Awareness Inventory (1994)</strong> is the field's most widely used measurement tool, deployed in hundreds of studies.</div>
          <div className={`${s.cardGrid} ${s.cols2}`}>
            <div className={`${s.card} ${s.cardStatic}`}>
              <div className={s.cardIcon}>📋</div>
              <div className={s.cardTitle}>52-item inventory</div>
              <div className={s.cardBody}>Two higher-order factors: Knowledge of Cognition and Regulation of Cognition. Alpha = .91 for each factor; .95 for the full scale. Used in hundreds of studies across educational contexts.</div>
            </div>
            <div className={`${s.card} ${s.cardStatic}`}>
              <div className={s.cardIcon}>🔑</div>
              <div className={s.cardTitle}>Why conditional knowledge matters</div>
              <div className={s.cardBody}>The MAI captures all three knowledge sub-types. Conditional knowledge is the most commonly under-taught: learners know strategies exist but don't know when they're appropriate. A distinct instructional target.</div>
            </div>
          </div>
        </>
      ),
    },
  ]

  const sdlTabs = [
    {
      id: 'knowles', label: 'Knowles (1975)', content: (
        <>
          <div className={s.callout}><strong>Knowles (1975):</strong> SDL is "a process in which individuals take the initiative, with or without the help of others, in diagnosing their learning needs, formulating goals, identifying human and material resources, choosing and implementing learning strategies, and evaluating learning outcomes."</div>
          <div className={`${s.cardGrid} ${s.cols2}`}>
            <div className={`${s.card} ${s.cardStatic}`}><div className={s.cardIcon}>🌱</div><div className={s.cardTitle}>Humanistic tradition</div><div className={s.cardBody}>Knowles' andragogical model positions SDL within adult learning: mature learners are self-concept-driven, draw on experience, and are motivated by relevance. The teacher becomes a facilitator.</div></div>
            <div className={`${s.card} ${s.cardStatic}`}><div className={s.cardIcon}>⚠️</div><div className={s.cardTitle}>The cognitive gap</div><div className={s.cardBody}>Knowles describes <em>what</em> SDL involves but says little about the cognitive mechanisms that make it possible. This is where metacognition becomes essential: it is the how of SDL.</div></div>
          </div>
        </>
      ),
    },
    {
      id: 'garrison', label: 'Garrison (1997)', content: (
        <>
          <div className={`${s.cardGrid} ${s.cols3}`}>
            <div className={`${s.card} ${s.cardStatic}`} style={{ borderTop: '3px solid #E76F51' }}><div className={s.cardIcon}>🔥</div><div className={s.cardTitle}>Motivation</div><div className={s.cardBody}>Entering motivation (inclination to engage) + task motivation (will to persist). Motivation is the gateway: it determines whether regulatory processes are activated at all.</div></div>
            <div className={`${s.card} ${s.cardStatic}`} style={{ borderTop: '3px solid #2E75B6' }}><div className={s.cardIcon}>📐</div><div className={s.cardTitle}>Self-Management</div><div className={s.cardBody}>Contextual control over the external conditions of learning: goal-setting, resource identification, managing the environment.</div></div>
            <div className={`${s.card} ${s.cardStatic}`} style={{ borderTop: '3px solid #2A9D8F' }}><div className={s.cardIcon}>🔍</div><div className={s.cardTitle}>Self-Monitoring</div><div className={s.cardBody}>The internal, cognitive-metacognitive regulation of the learning process. This is Garrison's explicit bridge to metacognition: self-monitoring is the metacognitive core of SDL.</div></div>
          </div>
          <div className={`${s.callout} ${s.green}`}><strong>Key interdependence:</strong> Motivation enables self-monitoring; successful self-monitoring reinforces task motivation. This bidirectional loop is central to the three-pillar framework in Section 4.</div>
        </>
      ),
    },
    {
      id: 'zimmerman', label: 'Zimmerman & Pintrich', content: (
        <>
          <p className={s.sectionIntro}>Zimmerman's (2002) cyclical model and Pintrich's (2000, 2004) elaboration provide the most detailed cognitive account of SDL. Click a phase to learn more.</p>
          <SDLCycle />
          <div className={s.callout}><strong>Pintrich's extension (2000, 2004):</strong> Metacognition operates across all three phases: in planning which strategies to use, monitoring during execution, and evaluating outcomes. Regulation is distributed across the entire learning episode.</div>
        </>
      ),
    },
  ]

  const implItems = [
    { title: "Teach metacognition explicitly: don't assume it develops on its own", body: 'There is consistent evidence that metacognitive development does not occur as an automatic by-product of content instruction. Explicit instruction (naming strategies, modelling processes, and scaffolding practice) is necessary, not optional.' },
    { title: 'Embed instruction in content, not in isolated skills programmes', body: 'Metacognitive instruction embedded within specific subject lessons is more effective than standalone programmes. Learners need to apply strategies to real challenges, not abstract exercises.' },
    { title: 'Give special attention to conditional knowledge', body: 'Declarative and procedural knowledge are relatively straightforward to teach; conditional knowledge (knowing when and why) is harder and more commonly neglected. Instruction must address this explicitly by presenting strategies in varied contexts and discussing when each is most effective.' },
    { title: 'Address motivation and metacognition together', body: 'Anxious learners or those with fixed mindsets will not deploy metacognitive strategies even when they possess them. Motivational climate, attribution feedback, and self-efficacy must be addressed alongside cognitive strategy instruction.' },
    { title: 'Assess metacognitive processes, not just outcomes', body: 'Process-focused assessment (metacognitive journals, planning documents, self-evaluation portfolios) develops and evaluates metacognitive competence. Rubrics that include strategy selection, monitoring behaviour, and reflective evaluation signal to learners what is valued.' },
  ]

  return (
    <div className={s.metacogLab}>
      {showWelcome && (
        <WelcomeModal
          mode={mode}
          onModeChange={setMode}
          hasProgress={hasProgress}
          isComplete={isJourneyComplete}
          activityDoneCount={activityDone.length}
          onStart={startMode}
          onReset={handleReset}
        />
      )}

      <JourneyBar
        visible={journeyActive}
        step={step}
        activityDone={activityDone}
        onActivity={() => setActiveActivity(step)}
        onPrev={prevStep}
        onNext={nextStep}
        onExit={exitJourney}
      />

      {activeActivity !== null && (
        <ActivityModal
          stepIndex={activeActivity}
          onComplete={handleActivityComplete}
          onClose={() => setActiveActivity(null)}
        />
      )}

      {showExitConfirm && (
        <ExitConfirmModal onConfirm={confirmExit} onCancel={cancelExit} />
      )}

      {/* TOP NAV */}
      <nav className={s.topbar}>
        <div className={s.navLeft}>
          <a href={backHref ?? '/'} className={s.navBack}>← Back to Portfolio</a>
        </div>
        <div className={s.navCenter}>
          {NAV_SECTIONS.map(sec => (
            <button
              key={sec.id}
              className={`${s.navBtn} ${activeSection === sec.id ? s.active : ''}`}
              onClick={() => navTo(sec.id)}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </nav>

      <div className={`${s.pageWrap} ${journeyActive ? s.withSidebar : ''}`}>
      <div className={s.page}>

        {/* HOW TO USE */}
        <section id="how-to-use">
          <div className={s.howToUse}>
            <h2>How to Use This Resource</h2>
            <p className={s.htuSub}>Two modes are available. The Guided Journey is strongly recommended for anyone seeking to build deep, transferable understanding, not just familiarity with the content.</p>
            <div className={s.modes}>
              <div className={`${s.modeCard} ${s.highlight}`}>
                <div className={s.mcIcon}>🧭</div>
                <div className={s.mcTitle}>Guided Journey (Recommended)</div>
                <div className={s.mcDesc}>A 7-step path that takes you from a self-assessment baseline through concept-building activities, scenario analysis, and a personal action plan. Each step directs you to the relevant section, then challenges you to apply what you've read before moving on. Approximately 25–35 minutes.</div>
                <button className={s.mcCta} onClick={startJourney}>Start Guided Journey →</button>
              </div>
              <div className={s.modeCard}>
                <div className={s.mcIcon}>🗺️</div>
                <div className={s.mcTitle}>Explore Freely</div>
                <div className={s.mcDesc}>Use the navigation bar to jump to any section. Click cards to expand detail, explore tabs, and interact with diagrams in any order. Best used as a reference after completing the Guided Journey, or for targeted review of a specific concept.</div>
                <button className={`${s.mcCta} ${s.outline}`} onClick={() => navTo('how-to-use')}>Use nav bar above ↑</button>
              </div>
            </div>
            <div className={s.journeyStepsPreview}>
              <p>What the Guided Journey covers</p>
              <div className={s.stepPills}>
                {['Baseline self-assessment', "Flavell's components: classify scenarios", 'Knowledge vs. Regulation: sort examples', 'SDL theories: match theorists', 'Evidence: apply the framework to a learner scenario', 'Five-Stage Model: diagnose a teaching situation', 'Synthesis: build your personal action plan'].map((label, i) => (
                  <div key={i} className={s.stepPill}><span className={s.spNum}>{i}</span>{label}</div>
                ))}
              </div>
            </div>
            <p className={s.metaNote}>Note: The Guided Journey is itself designed using the principles this review describes: activating prior knowledge, building concepts progressively, applying ideas to real scenarios, and synthesising into action. As you work through it, notice how the structure models the five-stage instructional approach outlined in Section 5.</p>
          </div>
        </section>

        {/* OVERVIEW / HERO */}
        <section id="overview">
          <div className={s.hero}>
            <div className={s.heroSub}>Literature Review · May 2026</div>
            <h1>Metacognition and Self-Directed Learning</h1>
            <div className={s.heroAbstract}>
              This review examines how metacognition (thinking about one's own thinking) functions as the cognitive engine of self-directed learning. Drawing on Flavell (1979), Brown (1987), Zimmerman (2002), Pintrich (2000, 2004), and Garrison (1997), it proposes a three-pillar integrative framework and a five-stage instructional model for cultivating metacognitive skills in learners.
            </div>
            <div className={s.statSection}>
              <div className={s.statHeading}>What the research says.</div>
              <div className={s.statRow}>
                <div className={s.statCard}>
                  <span className={s.statEyebrow}>Teaching impact</span>
                  <span className={s.statNum}><Counter target={7} /></span>
                  <span className={s.statLbl}>months of extra progress per year when metacognitive strategies are explicitly taught (EEF, 2021)</span>
                </div>
                <div className={s.statCard}>
                  <span className={s.statEyebrow}>Predicts achievement</span>
                  <span className={s.statNum}><Counter target={17} suffix="%" /></span>
                  <span className={s.statLbl}>of student learning outcomes explained by metacognitive skill, more than IQ alone (Veenman, 2006)</span>
                </div>
                <div className={s.statCard}>
                  <span className={s.statEyebrow}>Evidence base</span>
                  <span className={s.statNum}><Counter target={355} /></span>
                  <span className={s.statLbl}>studies reviewed, effective across literacy, maths, and science (EEF, 2021)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METACOGNITION */}
        <section id="metacognition" className={s.section}>
          <div className={s.sectionHeader}><div className={s.sectionNum}>1</div><h2>What is Metacognition?</h2></div>
          <p className={s.sectionIntro}>Metacognition is "knowledge and cognition about cognitive phenomena" (Flavell, 1979, p. 906). It is not a single skill but a layered construct. Click each card to explore the detail.</p>
          <h3 className={s.subheading}>Flavell's Four Components (1979)</h3>
          <ExpandCardGrid colsClass={s.cols4}>
            <ExpandCard tag="Component 1" icon="🧠" title="Metacognitive Knowledge" body="Stored beliefs about oneself, tasks, and strategies." detail={'Includes what you know about yourself as a learner (e.g. "I retain more by teaching others"), about the nature of cognitive tasks, and about cognitive strategies. This is the most commonly assessed component.'} />
            <ExpandCard tag="Component 2" icon="💡" title="Metacognitive Experiences" body="Real-time feelings about your current cognitive state." detail={'The subjective sense of confusion, familiarity, or difficulty, for example, the "tip-of-the-tongue" feeling or the "illusion of knowing." These experiences should trigger strategy adjustment, but often don\'t because monitoring is inaccurate.'} />
            <ExpandCard tag="Component 3" icon="🎯" title="Metacognitive Goals" body="The cognitive aims that guide a learning episode." detail={'The conscious or semi-conscious cognitive aim a learner sets, e.g. "I need to understand this well enough to explain it," not just recognise it. Goal clarity shapes what the learner monitors and how they evaluate success.'} />
            <ExpandCard tag="Component 4" icon="🔧" title="Metacognitive Actions" body="Deliberate steps taken in response to metacognitive experiences." detail="The adaptive moves made when monitoring signals something is wrong: re-reading, seeking help, switching strategy, breaking a task into smaller units. Without this component, metacognitive awareness has no practical consequence." />
          </ExpandCardGrid>
          <div style={{ height: 20 }} />
          <h3 id="browns-distinction" className={s.subheading}>Brown's Distinction: Knowledge vs Regulation (1987)</h3>
          <TabGroup tabs={metaTabs} />
        </section>

        <hr className={s.divider} />

        {/* SDL THEORY */}
        <section id="sdl" className={s.section}>
          <div className={s.sectionHeader}><div className={s.sectionNum}>2</div><h2>Self-Directed Learning: Theoretical Landscape</h2></div>
          <p className={s.sectionIntro}>SDL has been theorised from humanistic, cognitive, and social-cognitive traditions. The major frameworks converge on a core insight: SDL is an intentional, cyclical process of managing one's own learning. Click a theorist to explore their model.</p>
          <TabGroup tabs={sdlTabs} />
        </section>

        <hr className={s.divider} />

        {/* EVIDENCE */}
        <section id="evidence" className={s.section}>
          <div className={s.sectionHeader}><div className={s.sectionNum}>3</div><h2>What the Evidence Shows</h2></div>
          <p className={s.sectionIntro}>A robust body of empirical evidence demonstrates that metacognitive skill is one of the strongest and most teachable predictors of learning performance.</p>
          <div className={s.chartWrap}>
            <h3>Variance in Learning Performance Explained (Veenman et al., 2006)</h3>
            <VarianceChart />
            <p className={s.footnote}>Metacognition uniquely explains more variance in learning performance than general intelligence. These figures are averages across students of different ages, domains, and task types.</p>
          </div>
          <div className={`${s.cardGrid} ${s.cols2}`}>
            <div className={`${s.callout} ${s.green}`}><strong>Education Endowment Foundation (2021)</strong><br />Rating: <span style={{ color: '#2A9D8F', fontWeight: 700 }}>High impact · Low cost</span><br />~7 months extra progress per year when metacognitive strategies are explicitly taught. Evidence from 355 studies. Effect consistent across literacy, maths, and science.</div>
            <div className={`${s.callout} ${s.gold}`}><strong>Veenman (2006): the critical finding</strong><br />Metacognitive skillfulness outweighs <em>intelligence</em> as a predictor of learning. While IQ is largely fixed, metacognitive skills are teachable. This reframes the equity argument: metacognitive instruction levels the field.</div>
          </div>
          <div className={`${s.cardGrid} ${s.cols2}`} style={{ marginTop: 14 }}>
            <div className={`${s.card} ${s.cardStatic}`}><div className={s.cardIcon}>📊</div><div className={s.cardTitle}>Online monitoring matters most</div><div className={s.cardBody}>Think-aloud measures of online monitoring correlated with academic performance at <strong>r = .53</strong>, more than twice the correlation of self-report questionnaires (r = .23). What learners <em>do</em> when monitoring matters more than what they say they believe about it.</div></div>
            <div className={`${s.card} ${s.cardStatic}`}><div className={s.cardIcon}>🔗</div><div className={s.cardTitle}>Metacognition × Motivation = SDL</div><div className={s.cardBody}>SEM studies confirm that metacognitive awareness and motivational orientation jointly predict SDL readiness. Metacognition predicts performance <em>via</em> SDL readiness: the two are tightly coupled, not independent.</div></div>
          </div>
        </section>

        <hr className={s.divider} />

        {/* FRAMEWORK */}
        <section id="framework" className={s.section}>
          <div className={s.sectionHeader}><div className={s.sectionNum}>4</div><h2>The Three-Pillar Framework</h2></div>
          <p className={s.sectionIntro}>Three metacognitive pillars function as the cognitive engine of SDL. Each pillar is primarily activated at a different phase of the SDL cycle. Click each pillar for full detail.</p>
          <Pillars />
          <div className={s.callout} style={{ marginTop: 0 }}><strong>The Motivational Bridge:</strong> Metacognitive processes will not activate unless the learner is sufficiently motivated. Zimmerman &amp; Moylan (2009) describe self-regulation as "where metacognition and motivation intersect." Addressing motivation is therefore not optional: it is a gateway condition for the entire framework.</div>
          <div style={{ height: 20 }} />
          <h3 className={s.subheading}>Pillars Mapped to the SDL Cycle</h3>
          <div className={s.mapTableWrap}>
            <table className={s.mapTable}>
              <thead><tr><th>SDL Phase</th><th>Metacognitive Pillar</th><th>Core Process</th><th>SDL Enabling Function</th></tr></thead>
              <tbody>
                <tr><td><span className={s.phaseBadge} style={{ background: '#1F4E79' }}>Planning</span></td><td><strong>Knowledge</strong></td><td>Activating beliefs about self, task, and strategies</td><td>Diagnosing needs; setting goals; selecting strategies</td></tr>
                <tr><td><span className={s.phaseBadge} style={{ background: '#2E75B6' }}>Execution</span></td><td><strong>Monitoring</strong></td><td>Real-time awareness of progress and comprehension</td><td>Tracking progress; detecting gaps; sustaining effort</td></tr>
                <tr><td><span className={s.phaseBadge} style={{ background: '#2A9D8F' }}>Evaluation</span></td><td><strong>Control / Regulation</strong></td><td>Adjusting strategies; attributing outcomes; feeding forward</td><td>Evaluating achievement; refining future plans</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <hr className={s.divider} />

        {/* CULTIVATING */}
        <section id="cultivating" className={s.section}>
          <div className={s.sectionHeader}><div className={s.sectionNum}>5</div><h2>Cultivating Metacognitive Skills: A Five-Stage Model</h2></div>
          <p className={s.sectionIntro}>A developmental instructional progression: from external scaffolding to independent, transferable self-regulation. Each stage builds on the last. Click to expand.</p>
          <Stages />
        </section>

        <hr className={s.divider} />

        {/* IMPLICATIONS */}
        <section id="implications" className={s.section}>
          <div className={s.sectionHeader}><div className={s.sectionNum}>6</div><h2>Implications for Practice</h2></div>
          <Accordion items={implItems} />
        </section>

        <hr className={s.divider} />

        {/* SYNTHESIS */}
        <SynthesisSection
          baseline={baseline}
          actionPlan={actionPlan}
          isComplete={isJourneyComplete}
          onStartJourney={startJourney}
        />

        <hr className={s.divider} />

        {/* REFERENCES */}
        <section id="references" className={s.section}>
          <div className={s.sectionHeader}><div className={s.sectionNum}>7</div><h2>References</h2></div>
          <div className={s.refs}>
            {[
              ['Brown, A. L. (1987).', 'Metacognition, executive control, self-regulation, and other more mysterious mechanisms. In F. E. Weinert & R. H. Kluwe (Eds.), Metacognition, motivation, and understanding (pp. 65–116). Lawrence Erlbaum.'],
              ['Education Endowment Foundation. (2021).', 'Metacognition and self-regulated learning: Guidance report (2nd ed.). EEF.'],
              ['Flavell, J. H. (1979).', 'Metacognition and cognitive monitoring: A new area of cognitive-developmental inquiry. American Psychologist, 34(10), 906–911.'],
              ['Garrison, D. R. (1997).', 'Self-directed learning: Toward a comprehensive model. Adult Education Quarterly, 48(1), 18–33.'],
              ['Knowles, M. S. (1975).', 'Self-directed learning: A guide for learners and teachers. Association Press.'],
              ['Pintrich, P. R. (2000).', 'The role of goal orientation in self-regulated learning. In M. Boekaerts, P. R. Pintrich, & M. Zeidner (Eds.), Handbook of self-regulation (pp. 451–502). Academic Press.'],
              ['Pintrich, P. R. (2004).', 'A conceptual framework for assessing motivation and self-regulated learning in college students. Educational Psychology Review, 16(4), 385–407.'],
              ['Schraw, G., & Dennison, R. S. (1994).', 'Assessing metacognitive awareness. Contemporary Educational Psychology, 19(4), 460–475.'],
              ['Veenman, M. V. J., Van Hout-Wolters, B. H. A. M., & Afflerbach, P. (2006).', 'Metacognition and learning: Conceptual and methodological considerations. Metacognition and Learning, 1(1), 3–14.'],
              ['Zimmerman, B. J. (2002).', 'Becoming a self-regulated learner: An overview. Theory into Practice, 41(2), 64–70.'],
              ['Zimmerman, B. J., & Moylan, A. R. (2009).', 'Self-regulation: Where metacognition and motivation intersect. In D. J. Hacker, J. Dunlosky, & A. C. Graesser (Eds.), Handbook of metacognition in education (pp. 299–315). Routledge.'],
            ].map(([author, text]) => (
              <div key={author} className={s.ref}><strong>{author}</strong> {text}</div>
            ))}
          </div>
        </section>

      </div>
      </div>
    </div>
  )
}
