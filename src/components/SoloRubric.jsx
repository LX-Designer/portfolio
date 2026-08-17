import { useState, useRef, useEffect } from "react";

// Ported from a static HTML/vanilla-JS prototype into a real React component,
// following the same pattern as NaturalSelection.jsx. Reuses the site's own
// design tokens (--bg, --line, --blue, etc. — defined once in global.css)
// rather than redeclaring them, since the prototype already used the same
// variable names and values.

const CRITERIA = [
  {
    id: "cause",
    name: "Analysis of cause and effect",
    descriptors: {
      0: "Does not yet identify an effect of the rate rise on consumer spending.",
      1: "Names a single effect of the rate rise, without linking it to spending overall.",
      2: "Names several separate effects on households, but treats each as independent.",
      3: "Links the effects together, showing how they act on spending at the same time.",
      4: "Identifies conditions, such as fixed-rate lending, under which the causal link would weaken or change.",
    },
  },
  {
    id: "terms",
    name: "Use of economic terminology",
    descriptors: {
      0: "Does not yet use relevant economic terminology to explain the mechanism.",
      1: "Names one economic term, without applying it to the mechanism at work.",
      2: "Uses several terms correctly, each explained separately from the others.",
      3: "Uses the terms together to explain how the mechanism actually works.",
      4: "Uses the terms to question the underlying model, asking whether it holds in all conditions.",
    },
  },
  {
    id: "structure",
    name: "Structure of argument",
    descriptors: {
      0: "Does not yet present a claim connected to the task.",
      1: "Asserts a conclusion without supporting it.",
      2: "Presents several supported points in sequence, without building between them.",
      3: "Builds each point on the one before it, toward a single conclusion.",
      4: "Anticipates a counter-case and resolves it within the argument.",
    },
  },
];

const RESPONSES = [
  {
    id: "r1",
    text: "A rise in interest rates affects households in a few ways. Mortgage repayments become more expensive. Saving earns a better return than before. Borrowing for large purchases costs more as well. This is really all about disposable income. Consumer spending will fall as a result of the rate rise, which is what tends to happen whenever the central bank decides to raise rates.",
    levels: { cause: 2, terms: 1, structure: 1 },
  },
  {
    id: "r2",
    text: "Interest rate rises produce several effects. Mortgage repayments increase. Borrowing for large purchases costs more. Saving also becomes more attractive: as disposable income falls, the opportunity cost of spending rather than saving rises at the same moment, so the two act together on what a household chooses to do. Deposits earn more too. These are the main effects on consumer spending.",
    levels: { cause: 2, terms: 3, structure: 2 },
  },
  {
    id: "r3",
    text: "When rates rise, higher mortgage repayments reduce the money households have available, while better returns on savings make holding money back more rewarding. Because both changes act at the same time, spending power is squeezed from two directions rather than one, so the combined effect is stronger than either alone. Disposable income is what remains after fixed costs. Opportunity cost is the return given up by spending.",
    levels: { cause: 3, terms: 2, structure: 3 },
  },
  {
    id: "r4",
    text: "Higher repayments and stronger savings returns work together to reduce spending, since falling disposable income raises the opportunity cost of spending at the same moment; the two pull in one direction. But this assumes borrowers feel the rise immediately. Where most mortgages are fixed-rate, existing borrowers are shielded until renewal, so the same rise could act far more slowly. An unexpected rise might even lift spending briefly.",
    levels: { cause: 4, terms: 3, structure: 4 },
  },
  {
    id: "r5",
    text: "Interest rates are set by the central bank and change over time depending on inflation and other factors in the economy. Banks use interest rates for loans and savings accounts, and different banks offer different rates to their customers. The economy has many parts that all work together in different ways depending on the situation and what else is happening in the country at the time.",
    levels: { cause: 0, terms: 0, structure: 0 },
  },
];

const LEVEL_LABELS = ["Emerging", "Developing", "Functional", "Proficient", "Advanced"];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// scrollIntoView's "smooth" behaviour has no controllable duration, so the
// descriptor-strip glide is driven manually instead. scroll-snap-type is
// switched off for the duration: with it left on, the browser treats every
// scrollLeft write as a scroll gesture and periodically injects its own
// snap-correction nudges mid-flight, fighting the tween frame-by-frame and
// making the motion look jerky instead of one continuous glide. It's safe
// to re-enable once settled, since the tween's own target already is the
// slide's snap-center position.
function animateScrollLeft(el, target, duration) {
  const start = el.scrollLeft;
  const change = target - start;
  if (change === 0) return;
  el.style.scrollSnapType = "none";
  const startTime = performance.now();
  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    el.scrollLeft = start + change * easeInOutCubic(t);
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      el.style.scrollSnapType = "";
    }
  }
  requestAnimationFrame(step);
}

export default function SoloRubric() {
  // Shuffled once per mount, not on every re-render — response order isn't
  // meant to hint at which is "best", but it shouldn't reshuffle under the
  // learner mid-use either.
  const [responses] = useState(() => shuffle(RESPONSES));
  const [selectedId, setSelectedId] = useState(null);
  const resultsRef = useRef(null);
  // Keyed by criterion id, one per mobile descriptor strip — used to drive
  // the reveal sweep below.
  const mobileScrollRefs = useRef({});

  const selected = responses.find((r) => r.id === selectedId) || null;

  // Runs after React commits the DOM update for the newly-selected response,
  // so the scroll targets the results panel's actual post-update position.
  useEffect(() => {
    if (!selectedId || !selected) return;
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    // Each mobile descriptor strip starts snapped to its leftmost ("Emerging")
    // slide, then glides across to the matched level in parallel with the
    // section's own scroll-into-view above (only lightly staggered per
    // criterion row) rather than waiting for it to finish — so the rubric
    // rises into view while its descriptors are visibly settling into place
    // at the same time, instead of two separate steps. A custom tween (not
    // scrollIntoView) is used because native smooth-scroll duration isn't
    // controllable, and this glide is deliberately slower/gentler than the
    // browser's own default. A response matched at "Emerging" has nowhere to
    // glide from, which is fine — the peeking edge to its right still shows
    // the row scrolls.
    const timers = CRITERIA.map((c, i) => {
      const strip = mobileScrollRefs.current[c.id];
      const lvl = selected.levels[c.id];
      // +1 to skip the leading spacer element (see sr-mcard-spacer).
      const matchedSlide = strip?.children[lvl + 1];
      if (!strip || !matchedSlide) return null;
      strip.scrollLeft = 0;
      // getBoundingClientRect, not offsetLeft: .sr-mcard-scroll has no
      // `position` set, so offsetLeft on its children resolves against the
      // nearest positioned ancestor (body) rather than the strip itself —
      // viewport-relative rects sidestep that entirely.
      const stripRect = strip.getBoundingClientRect();
      const slideRect = matchedSlide.getBoundingClientRect();
      const target = strip.scrollLeft + (slideRect.left - stripRect.left) - (strip.clientWidth - matchedSlide.clientWidth) / 2;
      return setTimeout(() => animateScrollLeft(strip, target, 1300), i * 90);
    });
    return () => timers.forEach((t) => t && clearTimeout(t));
  }, [selectedId]);

  const handleSelect = (r) => setSelectedId(r.id);

  return (
    <div className="solo-rubric">
      <style>{`
        .solo-rubric{background:var(--bg);border:1px solid var(--line);border-radius:16px;padding:36px 34px;
          font-family:'Inter',sans-serif;color:var(--text);font-size:16px;line-height:1.6;
          container-type:inline-size;}
        .solo-rubric *{box-sizing:border-box;}
        .sr-h2{font-family:'Poppins',sans-serif;font-weight:600;font-size:20px;margin:0 0 20px;color:var(--text);}
        .sr-task-callout{background:var(--blue-bg);border:1px solid var(--line);border-left:3px solid var(--blue);
          border-radius:var(--radius);padding:16px 18px;margin:0 0 20px;}
        .sr-task-label{font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;
          color:var(--blue);margin:0 0 6px;}
        .sr-task{font-size:15.5px;font-weight:600;line-height:1.5;margin:0;color:var(--text);}
        .sr-instruct{font-size:14px;color:var(--text-soft);margin:0 0 20px;}
        .sr-reselect-hint{font-size:13.5px;color:var(--text-soft);margin:18px 0 0;}
        .sr-option{display:block;width:100%;text-align:left;background:#fff;border:1px solid var(--line);
          border-radius:var(--radius);padding:16px 18px;margin-bottom:10px;cursor:pointer;
          font-family:'Inter',sans-serif;font-size:14.5px;line-height:1.65;color:var(--text);
          transition:all .12s ease;}
        .sr-option:hover{border-color:var(--blue);}
        .sr-option.selected{background:var(--blue-bg);border-color:var(--blue);}
        .sr-option:focus-visible{outline:2px solid var(--blue);outline-offset:2px;}
        .sr-results{margin-top:40px;padding-top:28px;border-top:1px solid var(--line);}
        .sr-results-title{font-family:'Poppins',sans-serif;font-size:16px;font-weight:600;margin:0 0 4px;}
        .sr-results-sub{font-size:13.5px;color:var(--text-soft);margin:0 0 20px;}
        .sr-table-wrap{overflow-x:auto;}
        .sr-table{width:100%;border-collapse:collapse;table-layout:fixed;min-width:720px;}
        .sr-table th,.sr-table td{border:1px solid var(--line);padding:12px 14px;text-align:left;vertical-align:top;}
        .sr-table th{background:var(--bg-soft);}
        .sr-crit-col{width:170px;}
        .sr-level-head{font-family:'Poppins',sans-serif;font-size:13.5px;font-weight:600;}
        .sr-corner{font-size:11px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;
          color:var(--text-soft);vertical-align:bottom;}
        .sr-crit-cell{background:var(--bg-soft);}
        .sr-crit-name{font-size:13.5px;font-weight:600;margin:0;}
        .sr-level-cell{font-size:13px;color:var(--text-soft);line-height:1.55;}
        .sr-level-cell.hit{background:var(--blue-bg);color:var(--text);font-weight:500;
          box-shadow:inset 0 0 0 1px var(--blue);position:relative;z-index:1;}

        /* Below ~720px of available width the table needs horizontal scrolling
           to show all six columns, and the cell that actually answers "how did
           this response grade" ends up scrolled off-screen after selecting one.
           A container query (not a viewport media query) drives this because
           this component can render inside the narrower modal popup as well as
           the full page — what matters is its own rendered width, not the
           browser window's. Below that width, swap the table for a stacked
           per-criterion view that surfaces the same result without scrolling. */
        .sr-mobile-results{display:none;}
        .sr-mcard{border:1px solid var(--line);border-radius:var(--radius);padding:14px 16px;margin-bottom:10px;}
        .sr-mcard:last-child{margin-bottom:0;}
        .sr-mcard-crit{font-size:13.5px;font-weight:600;margin:0 0 8px;color:var(--text);}
        /* Horizontally-swipeable strip of all five level descriptors, not
           just the matched one — sized so roughly three are visible at once
           (a sliver of the previous level, the full current one, a sliver of
           the next), with a fade at each edge instead of a hard crop, so the
           slivers themselves read as "more this way" rather than clipped
           content. Native scroll-snap handles swipe physics; no drag JS
           needed. The reveal sweep on selection is driven from the
           component's own effect via mobileScrollRefs.
           The two sr-mcard-spacer elements matter more than they look: the
           first and last slides have no neighbour to peek at on one side,
           so without extra room there the browser clamps scrolling at the
           content edge instead of centering them — they end up jammed flush
           against the strip's boundary, and the mask (which fades a fixed
           band of the container, not "whatever happens to be scrolled
           there") ends up cropping straight through the slide's own shape
           instead of fading empty space. Real flex-item spacers are used
           rather than padding on the scroll container itself, because
           trailing/leading padding on a scrollable flex container isn't
           reliably included in its scrollWidth across browsers — a spacer
           is a genuine flex item, so it always is. */
        .sr-mcard-scroll{display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;
          -webkit-overflow-scrolling:touch;scrollbar-width:none;padding:2px 0 4px;
          -webkit-mask-image:linear-gradient(to right,transparent,black 20px,black calc(100% - 20px),transparent);
          mask-image:linear-gradient(to right,transparent,black 20px,black calc(100% - 20px),transparent);}
        .sr-mcard-scroll::-webkit-scrollbar{display:none;}
        .sr-mcard-spacer{flex:0 0 10%;}
        .sr-mcard-slide{flex:0 0 80%;scroll-snap-align:center;background:var(--bg-soft);
          border-radius:8px;padding:10px 12px;box-shadow:inset 0 0 0 1px var(--line);}
        .sr-mcard-slide.hit{background:var(--blue-bg);box-shadow:inset 0 0 0 1px var(--blue);}
        .sr-mcard-level{display:inline-block;font-family:'Poppins',sans-serif;font-size:11.5px;font-weight:600;
          letter-spacing:.03em;text-transform:uppercase;color:var(--text-soft);margin:0 0 4px;}
        .sr-mcard-slide.hit .sr-mcard-level{color:var(--blue);}
        .sr-mcard-desc{font-size:13.5px;line-height:1.55;color:var(--text);margin:0;}
        .sr-mcard-placeholder{font-size:13px;color:var(--text-soft);margin:0;font-style:italic;}

        @container (max-width:720px){
          .sr-table-wrap{display:none;}
          .sr-mobile-results{display:block;}
        }
        /* The border and radius are dropped on a phone screen too — there's
           no surrounding page chrome this card needs to visually separate
           from at that width, so it's just a second frame squeezed inside
           the piece page's own margin, taking width away from content that
           badly needs it. Horizontal padding goes to near-zero rather than
           just shrinking — the response options and callout below already
           carry their own border/background, so they read fine sitting
           flush against the page's own margin. */
        @media(max-width:600px){
          .solo-rubric{padding:16px 2px;border:none;border-radius:0;}
        }
      `}</style>

      <h2 className="sr-h2">Interactive Assessment Rubric</h2>

      <p className="sr-instruct">Select an example student response to the task to see how it scores on the assessment rubric. Each response is graded separately against all three criteria.</p>

      <div className="sr-task-callout">
        <p className="sr-task-label">Task</p>
        <p className="sr-task">Explain the effects of a rise in interest rates on consumer spending.</p>
      </div>

      <div>
        {responses.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`sr-option${selectedId === r.id ? " selected" : ""}`}
            onClick={() => handleSelect(r)}
          >
            {r.text}
          </button>
        ))}
      </div>

      <div className="sr-results" ref={resultsRef}>
        <p className="sr-results-title">How this response grades</p>
        <p className="sr-results-sub">
          {selected
            ? "The highlighted cell in each row is where this response sits on the assessment rubric. Select a different response to compare."
            : "Select a response above: the matching cell in each row will highlight."}
        </p>

        <div className="sr-table-wrap">
          <table className="sr-table">
            <colgroup>
              <col className="sr-crit-col" />
              <col /><col /><col /><col /><col />
            </colgroup>
            <thead>
              <tr>
                <th className="sr-corner">Criteria</th>
                {LEVEL_LABELS.map((label) => (
                  <th key={label} className="sr-level-head">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CRITERIA.map((c) => (
                <tr key={c.id}>
                  <td className="sr-crit-cell">
                    <p className="sr-crit-name">{c.name}</p>
                  </td>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <td
                      key={i}
                      className={`sr-level-cell${selected && selected.levels[c.id] === i ? " hit" : ""}`}
                    >
                      {c.descriptors[i]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sr-mobile-results">
          {CRITERIA.map((c) => {
            const lvl = selected ? selected.levels[c.id] : null;
            return (
              <div key={c.id} className="sr-mcard">
                <p className="sr-mcard-crit">{c.name}</p>
                {selected ? (
                  <div
                    className="sr-mcard-scroll"
                    ref={(el) => { mobileScrollRefs.current[c.id] = el; }}
                  >
                    <div className="sr-mcard-spacer" aria-hidden="true" />
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className={`sr-mcard-slide${i === lvl ? " hit" : ""}`}>
                        <span className="sr-mcard-level">{LEVEL_LABELS[i]}</span>
                        <p className="sr-mcard-desc">{c.descriptors[i]}</p>
                      </div>
                    ))}
                    <div className="sr-mcard-spacer" aria-hidden="true" />
                  </div>
                ) : (
                  <p className="sr-mcard-placeholder">Select a response above to see how its graded.</p>
                )}
              </div>
            );
          })}
        </div>

        {selected && (
          <p className="sr-reselect-hint">Select a different example response to see how it scores on the rubric.</p>
        )}
      </div>
    </div>
  );
}
