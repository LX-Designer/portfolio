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
      4: "Identifies conditions — such as fixed-rate lending — under which the causal link would weaken or change.",
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
      4: "Uses the terms to question the underlying model — whether it holds in all conditions.",
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
    text: "Higher repayments and stronger savings returns work together to reduce spending, since falling disposable income raises the opportunity cost of spending at the same moment — the two pull in one direction. But this assumes borrowers feel the rise immediately. Where most mortgages are fixed-rate, existing borrowers are shielded until renewal, so the same rise could act far more slowly. An unexpected rise might even lift spending briefly.",
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

export default function SoloRubric() {
  // Shuffled once per mount, not on every re-render — response order isn't
  // meant to hint at which is "best", but it shouldn't reshuffle under the
  // learner mid-use either.
  const [responses] = useState(() => shuffle(RESPONSES));
  const [selectedId, setSelectedId] = useState(null);
  const resultsRef = useRef(null);

  const selected = responses.find((r) => r.id === selectedId) || null;

  // Runs after React commits the DOM update for the newly-selected response,
  // so the scroll targets the results panel's actual post-update position.
  useEffect(() => {
    if (selectedId) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        .sr-task-label{font-size:13px;color:var(--text-soft);margin:0 0 4px;}
        .sr-task{font-size:16px;font-weight:600;margin:0 0 8px;}
        .sr-instruct{font-size:14px;color:var(--text-soft);margin:0 0 20px;}
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
        .sr-mcard-hit{background:var(--blue-bg);border-radius:8px;padding:10px 12px;box-shadow:inset 0 0 0 1px var(--blue);}
        .sr-mcard-level{display:inline-block;font-family:'Poppins',sans-serif;font-size:11.5px;font-weight:600;
          letter-spacing:.03em;text-transform:uppercase;color:var(--blue);margin:0 0 4px;}
        .sr-mcard-desc{font-size:13.5px;line-height:1.55;color:var(--text);margin:0;}
        .sr-mcard-placeholder{font-size:13px;color:var(--text-soft);margin:0;font-style:italic;}

        @container (max-width:720px){
          .sr-table-wrap{display:none;}
          .sr-mobile-results{display:block;}
        }
        @media(max-width:600px){
          .solo-rubric{padding:26px 20px;}
        }
      `}</style>

      <h2 className="sr-h2">SOLO rubric — table view</h2>

      <p className="sr-task-label">Task</p>
      <p className="sr-task">Explain the effects of a rise in interest rates on consumer spending.</p>
      <p className="sr-instruct">Select a student response below. Each one is graded separately against all three criteria.</p>

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
            ? "The highlighted cell in each row is where this response lands. Select a different response to compare."
            : "Select a response above — the matching cell in each row will highlight."}
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
                  <div className="sr-mcard-hit">
                    <span className="sr-mcard-level">{LEVEL_LABELS[lvl]}</span>
                    <p className="sr-mcard-desc">{c.descriptors[lvl]}</p>
                  </div>
                ) : (
                  <p className="sr-mcard-placeholder">Select a response above to see where it lands.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
