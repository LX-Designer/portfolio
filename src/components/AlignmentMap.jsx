import { useState, useEffect, useRef } from "react";

// Ported from a static HTML/vanilla-JS prototype into a real React component,
// following the same pattern as NaturalSelection.jsx and SoloRubric.jsx.
// Reuses the site's own design tokens (--blue, --line, etc. defined in
// global.css) rather than redeclaring them. Styling was refreshed on the way
// in: the case callout is now a white inset card (no side rule), the reveal
// buttons carry a chevron and a proper disabled/tooltip state, and the plan
// table groups its rows by outcome phase.

const OUTCOMES = [
  {
    id: "describe",
    label: "Outcome 1",
    verb: "Describe",
    outcomeHtml: (
      <>
        Students will <span className="iam-verb">describe</span> how the CRISPR-Cas9 system identifies and cuts a target DNA sequence.
      </>
    ),
    activities: [
      { title: "Labelling exercise", text: "Students label the key components (guide RNA, Cas9 enzyme, target DNA sequence) on a diagram of the CRISPR mechanism." },
      { title: "Sequencing task", text: "Students arrange the steps of the CRISPR-Cas9 process into the correct order, describing what happens at each stage." },
    ],
    content: [
      { label: "Key terms", text: "Guide RNA, Cas9 enzyme, target DNA sequence, PAM site" },
      { label: "Diagram", text: "Labelled cross-section of the CRISPR-Cas9 complex bound to target DNA" },
      { label: "Reference", text: "Short animation of the CRISPR-Cas9 mechanism" },
      { label: "Reading", text: "Brief history of CRISPR as a bacterial immune system" },
    ],
  },
  {
    id: "explain",
    label: "Outcome 2",
    verb: "Explain",
    outcomeHtml: (
      <>
        Students will <span className="iam-verb">explain</span> how off-target effects can occur during CRISPR gene editing.
      </>
    ),
    activities: [
      { title: "Sequence comparison", text: "Students compare a target DNA sequence with near-matching sequences elsewhere in the genome, identifying where Cas9 might bind incorrectly." },
      { title: "Modelled explanation", text: "The teacher walks through one instance of off-target cutting using the full causal chain, thinking aloud, before students see a second worked example." },
      { title: "Cause-and-effect mapping", text: "Students independently connect guide RNA specificity, sequence similarity, and binding conditions into one explanation of why off-target cutting occurs." },
    ],
    content: [
      { label: "Key terms", text: "Off-target effect, sequence specificity, genome-wide screening" },
      { label: "Data", text: "Reported off-target rates across different CRISPR delivery methods" },
      { label: "Case study", text: "A documented instance of off-target editing identified in CRISPR research" },
      { label: "Reference", text: "Short explainer on how researchers screen for off-target effects" },
    ],
  },
  {
    id: "evaluate",
    label: "Outcome 3",
    verb: "Evaluate",
    outcomeHtml: (
      <>
        Students will <span className="iam-verb">evaluate</span> the use of CRISPR gene-editing technology to treat inherited genetic diseases.
      </>
    ),
    activities: [
      { title: "Evidence gathering", text: "Students research and summarise the therapeutic potential of CRISPR gene editing, using a real case such as its use in treating sickle cell disease." },
      { title: "Criteria building", text: "As a class, students agree on what would count as strong evidence for or against using the therapy, such as effectiveness, safety, cost, and access." },
      { title: "Structured debate", text: "Students apply these criteria to weigh the therapeutic benefits against risks such as off-target effects and cost, then justify a position on when the technology should be used." },
    ],
    content: [
      { label: "Key terms", text: "CRISPR-Cas9, gene therapy, off-target effects, germline vs. somatic editing" },
      { label: "Data", text: "Comparison of cost, success rate, and access between CRISPR therapy and traditional bone marrow transplant" },
      { label: "Case study", text: "The first approved CRISPR-based therapy, used to treat sickle cell disease" },
      { label: "Reference", text: "Short explainer on how the CRISPR-Cas9 system edits DNA" },
    ],
  },
];

const ASSESSMENT_STEM =
  "Sickle cell disease is an inherited blood disorder that causes red blood cells to become rigid and sickle-shaped, leading to chronic pain, organ damage, and a shortened life expectancy. In 2023, a new therapy using CRISPR-Cas9 became the first gene-editing treatment of its kind to be approved. Doctors extract a patient’s own blood stem cells, edit them outside the body to switch on a gene that produces healthy red blood cells, then return the edited cells to the patient. In clinical trials, most patients treated this way became free of the severe pain episodes that define the disease.";

const LESSON_PLAN = [
  { outcome: "Describe", activity: "Label the CRISPR-Cas9 components on a diagram of the mechanism", resources: "Key terms, diagram" },
  { outcome: "Describe", activity: "Sequence the steps of the editing process in order", resources: "Animation, reading" },
  { outcome: "Explain", activity: "Compare a target sequence with near-matching DNA elsewhere in the genome", resources: "Key terms, data" },
  { outcome: "Explain", activity: "See a worked example of off-target cutting explained", resources: "Case study" },
  { outcome: "Explain", activity: "Independently explain a new off-target case", resources: "Applies prior learning" },
  { outcome: "Evaluate", activity: "Research the therapeutic case for CRISPR", resources: "Key terms, case study" },
  { outcome: "Evaluate", activity: "Agree criteria for judging the evidence", resources: "Data" },
  { outcome: "Evaluate", activity: "Debate and justify a position using the agreed criteria", resources: "Applies prior learning" },
];

// Group consecutive same-outcome lessons so the plan table can show one merged
// stage cell per phase, making the Describe → Explain → Evaluate progression
// legible at a glance.
function groupLessons() {
  const groups = [];
  LESSON_PLAN.forEach((l, i) => {
    const last = groups[groups.length - 1];
    const row = { ...l, lesson: i + 1 };
    if (last && last.outcome === l.outcome) last.rows.push(row);
    else groups.push({ outcome: l.outcome, rows: [row] });
  });
  return groups;
}

const ChevronDown = () => (
  <svg className="iam-chev" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function AlignmentMap() {
  const [currentId, setCurrentId] = useState(null);
  // Not keyed by outcome id — the reveal sequence (activities → content →
  // plan) is meant to replay from the start each time a new outcome is
  // selected, not accumulate independently per outcome.
  const [state, setState] = useState({ activities: false, content: false });
  const [syllabusRevealed, setSyllabusRevealed] = useState(false);
  const taskRef = useRef(null);

  const current = currentId ? OUTCOMES.find((o) => o.id === currentId) : null;
  const readyForPlan = state.activities && state.content;
  const groups = groupLessons();

  // After React commits the DOM update for a newly-selected outcome, bring the
  // task paragraph into view so the highlighted phrase is visible.
  useEffect(() => {
    if (currentId) taskRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentId]);

  function selectOutcome(id) {
    setCurrentId(id);
    setState({ activities: false, content: false });
    setSyllabusRevealed(false);
  }

  const revealActivities = () => setState((s) => ({ ...s, activities: true }));
  const revealContent = () => setState((s) => ({ ...s, content: true }));

  return (
    <div className="alignment-map">
      <style>{`
        .alignment-map{background:var(--bg);border:1px solid var(--line);border-radius:16px;padding:36px 34px;
          font-family:'Inter',sans-serif;color:var(--text);font-size:16px;line-height:1.6;
          container-type:inline-size;}
        .alignment-map *{box-sizing:border-box;}
        .iam-h2{font-family:'Poppins',sans-serif;font-weight:600;font-size:20px;margin:0 0 12px;color:var(--text);}
        .iam-intro{font-size:14.5px;color:var(--text-soft);margin:0 0 24px;}
        .iam-stage-label{font-family:'Poppins',sans-serif;font-size:15px;font-weight:600;
          color:var(--text);margin:0 0 12px;}
        .iam-verb{color:var(--blue);font-weight:600;}

        /* Outcome selectors */
        .iam-outcome{display:block;width:100%;text-align:left;background:#fff;border:1px solid var(--line);
          border-radius:var(--radius);padding:14px 16px;margin-bottom:8px;cursor:pointer;
          font-family:'Inter',sans-serif;color:var(--text);transition:border-color .12s ease,background .12s ease;}
        .iam-outcome:hover{border-color:var(--blue);}
        .iam-outcome.selected{background:var(--blue-bg);border-color:var(--blue);}
        .iam-outcome:focus-visible{outline:2px solid var(--blue);outline-offset:2px;}
        .iam-outcome .num{font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;
          color:var(--text-soft);display:block;margin-bottom:4px;}
        .iam-outcome.selected .num{color:var(--blue);}
        .iam-outcome p{margin:0;font-size:14.5px;}

        .iam-cascade{margin-top:32px;padding-top:28px;border-top:1px solid var(--line);}

        /* Assessment task card + case callout */
        .iam-taskcard{background:var(--bg-soft);border-radius:var(--radius);padding:20px 22px;margin-bottom:16px;}
        .iam-case{background:#fff;border:1px solid var(--line);border-radius:11px;padding:15px 17px;margin-bottom:16px;}
        .iam-case-label{font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;
          color:var(--blue);margin:0 0 7px;}
        .iam-case-text{font-size:14px;color:var(--text-soft);line-height:1.65;margin:0;}
        .iam-task{font-size:15px;margin:0;}
        .iam-sub{font-size:13px;color:var(--text-soft);margin:14px 0 0;}
        .iam-phrase{border-radius:4px;padding:1px 3px;transition:background .15s ease,color .15s ease;}
        .iam-phrase.active{background:var(--blue-bg);color:var(--blue);font-weight:600;}

        /* Reveal buttons */
        .iam-tip{position:relative;display:block;}
        .iam-reveal{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;
          background:#fff;border:1px dashed var(--line);border-radius:var(--radius);padding:13px 16px;
          font-family:'Inter',sans-serif;font-size:14px;font-weight:600;color:var(--blue);cursor:pointer;
          transition:background .14s ease,border-color .14s ease,color .14s ease;}
        .iam-reveal:hover{background:var(--blue-bg);border-color:var(--blue);}
        .iam-reveal:focus-visible{outline:2px solid var(--blue);outline-offset:2px;}
        .iam-reveal .iam-chev{transition:transform .16s ease;}
        .iam-reveal:hover .iam-chev{transform:translateY(2px);}
        .iam-reveal.is-disabled{color:var(--text-soft);background:var(--bg-soft);border-style:solid;
          border-color:var(--line);cursor:default;}
        .iam-reveal.is-disabled:hover{background:var(--bg-soft);border-color:var(--line);}
        .iam-reveal.is-disabled .iam-chev{opacity:.5;}
        .iam-reveal.is-disabled:hover .iam-chev{transform:none;}

        /* Tooltip */
        .iam-tip-bubble{position:absolute;bottom:calc(100% + 10px);left:50%;
          transform:translateX(-50%) translateY(4px);
          background:var(--text);color:#fff;font-size:12.5px;font-weight:500;line-height:1.45;
          padding:9px 13px;border-radius:9px;width:max-content;max-width:250px;text-align:center;
          opacity:0;visibility:hidden;pointer-events:none;z-index:6;
          box-shadow:0 8px 24px rgba(20,20,20,.22);
          transition:opacity .16s ease,transform .16s ease;}
        .iam-tip-bubble::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);
          border:6px solid transparent;border-top-color:var(--text);}
        .iam-tip:hover .iam-tip-bubble,.iam-tip:focus-within .iam-tip-bubble,.iam-tip:active .iam-tip-bubble{
          opacity:1;visibility:visible;transform:translateX(-50%) translateY(0);}

        /* Activities — numbered like the plan table's lesson badges, so the
           sequence reads the same way it does there. */
        .iam-activity{display:flex;gap:14px;background:#fff;border:1px solid var(--line);
          border-radius:14px;padding:16px 18px;margin-bottom:10px;}
        .iam-activity:last-of-type{margin-bottom:0;}
        .iam-activity-num{flex:0 0 26px;width:26px;height:26px;border-radius:50%;
          background:var(--bg-soft);border:1px solid var(--line);color:var(--text-soft);
          font-family:'Poppins',sans-serif;font-size:12px;font-weight:700;
          display:flex;align-items:center;justify-content:center;margin-top:1px;}
        .iam-activity-body{flex:1;min-width:0;}
        .iam-activity-body p{margin:0;font-size:14.5px;line-height:1.55;color:var(--text-soft);}
        .iam-activity-body p.iam-activity-title{font-size:15px;font-weight:700;color:var(--text);margin:0 0 4px;}

        /* Content — a small two-column table (label / description), reusing
           the same bordered-cell, soft-gray-label language as the plan table
           below rather than plain stacked paragraphs. */
        .iam-content-table{width:100%;border-collapse:collapse;}
        .iam-content-table td{border:1px solid var(--line);padding:11px 14px;
          font-size:13.5px;line-height:1.55;vertical-align:top;}
        .iam-content-label{background:var(--bg-soft);font-family:'Poppins',sans-serif;
          font-weight:600;font-size:12.5px;color:var(--text);width:120px;white-space:nowrap;}
        .iam-content-text{color:var(--text-soft);}

        /* Below this container width the fixed 120px label column starts
           crowding the description text into a narrow strip. Stacking each
           row into its own bordered block (label on top) reads far better
           on a phone than a cramped two-column table. */
        @container (max-width:420px){
          .iam-content-table, .iam-content-table tbody, .iam-content-table tr, .iam-content-table td{
            display:block; width:100%;}
          .iam-content-table tr{margin-bottom:8px; border:1px solid var(--line); border-radius:var(--radius);
            overflow:hidden;}
          .iam-content-table tr:last-child{margin-bottom:0;}
          .iam-content-table td{border:none; border-bottom:1px solid var(--line);}
          .iam-content-table td:last-child{border-bottom:none;}
          .iam-content-label{width:auto; white-space:normal;}
        }

        /* Plan table */
        .iam-syllabus{margin-top:32px;padding-top:28px;border-top:1px solid var(--line);}
        .iam-table-wrap{overflow-x:auto;}
        .iam-table{width:100%;border-collapse:collapse;table-layout:fixed;min-width:560px;}
        .iam-table th,.iam-table td{border:1px solid var(--line);padding:10px 12px;text-align:left;
          font-size:12.5px;vertical-align:top;line-height:1.5;}
        .iam-table th{background:var(--bg-soft);font-family:'Poppins',sans-serif;font-size:11px;
          font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-soft);}
        .iam-col-stage{width:104px;} .iam-col-lesson{width:64px;} .iam-col-res{width:150px;}
        .iam-stage-cell{background:var(--bg-soft);font-family:'Poppins',sans-serif;font-weight:600;
          font-size:12.5px;color:var(--text);vertical-align:middle;}
        .iam-lesson-badge{display:inline-flex;align-items:center;justify-content:center;
          width:24px;height:24px;border-radius:50%;background:var(--bg-soft);border:1px solid var(--line);
          font-weight:600;font-size:12px;}
        .iam-row-assess td{background:var(--blue-bg);}
        .iam-row-assess .iam-stage-cell{background:var(--blue-bg);color:var(--blue);}
        .iam-row-assess .iam-lesson-badge{background:var(--blue);border-color:var(--blue);color:#fff;}
        .iam-assess-activity{font-weight:500;color:var(--text);}

        /* Below the table's own 560px min-width, the table-wrap's horizontal
           scroll works but forces sideways scrolling to read a lesson's
           activity and resources — a stacked card per lesson (like the
           content table's mobile view above) reads top-to-bottom instead. */
        .iam-plan-mobile{display:none;}
        .iam-plan-card{border:1px solid var(--line); border-radius:var(--radius); padding:12px 14px; margin-bottom:8px;}
        .iam-plan-card:last-child{margin-bottom:0;}
        .iam-plan-card.assess{background:var(--blue-bg); border-color:var(--blue);}
        .iam-plan-card-head{display:flex; align-items:center; gap:8px; margin-bottom:8px;}
        .iam-plan-stage{font-family:'Poppins',sans-serif; font-size:11px; font-weight:600;
          letter-spacing:.04em; text-transform:uppercase; color:var(--text-soft);}
        .iam-plan-card.assess .iam-plan-stage{color:var(--blue);}
        .iam-plan-activity{font-size:13.5px; line-height:1.5; color:var(--text); margin:0 0 4px;}
        .iam-plan-card.assess .iam-plan-activity{font-weight:500;}
        .iam-plan-resources{font-size:12.5px; color:var(--text-soft); margin:0;}

        @container (max-width:560px){
          .iam-table-wrap{display:none;}
          .iam-plan-mobile{display:block;}
        }

        /* A container can't query its own size — only its descendants can
           query it — so the padding reduction below uses a viewport media
           query instead of @container. The border and radius are dropped
           here too — on a phone screen there's no surrounding page chrome
           this card needs to visually separate from, so it's just a second
           frame squeezed inside the piece page's own margin, taking width
           away from content (like the tables above) that badly needs it.
           Horizontal padding goes to near-zero rather than just shrinking —
           the individual elements inside (outcome buttons, the task card)
           already carry their own border and padding, so they read fine
           sitting flush against the page's own margin, the same way the
           homepage's piece-cards do against .wrap. */
        @media (max-width:600px){
          .alignment-map{padding:16px 2px;border:none;border-radius:0;}
        }
      `}</style>

      <h2 className="iam-h2">Constructive Alignment Map</h2>
      <p className="iam-intro">
        Select a learning outcome to see how it is built into the assessment task and used to inform the course learning activities and content.
      </p>

      <p className="iam-stage-label">Learning outcomes</p>
      <div>
        {OUTCOMES.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`iam-outcome${currentId === o.id ? " selected" : ""}`}
            onClick={() => selectOutcome(o.id)}
          >
            <span className="num">{o.label}</span>
            <p>{o.outcomeHtml}</p>
          </button>
        ))}
      </div>

      <div className="iam-cascade">
        <p className="iam-stage-label">Assessment task</p>
        <div className="iam-taskcard">
          <div className="iam-case">
            <p className="iam-case-label">Case</p>
            <p className="iam-case-text">{ASSESSMENT_STEM}</p>
          </div>
          <p className="iam-task" ref={taskRef}>
            Using this case, write a response that{" "}
            <span className={`iam-phrase${currentId === "describe" ? " active" : ""}`}>
              describes how the CRISPR-Cas9 system identifies and cuts its target DNA sequence
            </span>
            ,{" "}
            <span className={`iam-phrase${currentId === "explain" ? " active" : ""}`}>
              explains why this process can sometimes cut DNA at the wrong location
            </span>
            , and uses this understanding to{" "}
            <span className={`iam-phrase${currentId === "evaluate" ? " active" : ""}`}>
              reach a justified judgement on whether CRISPR-Cas9 gene editing should be used more widely to treat inherited genetic diseases
            </span>
            .
          </p>
        </div>

        {!current ? (
          <span className="iam-tip">
            <span className="iam-reveal is-disabled" role="button" tabIndex={0} aria-disabled="true">
              Show the supporting activities <ChevronDown />
            </span>
            <span className="iam-tip-bubble" role="tooltip">
              Select a learning outcome above to view the supporting activities.
            </span>
          </span>
        ) : !state.activities ? (
          <button type="button" className="iam-reveal" onClick={revealActivities}>
            Show the supporting activities <ChevronDown />
          </button>
        ) : (
          <>
            <p className="iam-stage-label">Learning activities for {current.label}</p>
            {current.activities.map((a, i) => (
              <div className="iam-activity" key={i}>
                <span className="iam-activity-num">{i + 1}</span>
                <div className="iam-activity-body">
                  <p className="iam-activity-title">{a.title}</p>
                  <p>{a.text}</p>
                </div>
              </div>
            ))}
            <p className="iam-sub">Select a different learning outcome to see its aligned activities.</p>
            {!state.content ? (
              <button
                type="button"
                className="iam-reveal"
                style={{ marginTop: "14px" }}
                onClick={revealContent}
              >
                Show the learning content <ChevronDown />
              </button>
            ) : (
              <>
                <p className="iam-stage-label" style={{ marginTop: "14px" }}>
                  Learning content for {current.label}
                </p>
                <table className="iam-content-table">
                  <tbody>
                    {current.content.map((c, i) => (
                      <tr key={i}>
                        <td className="iam-content-label">{c.label}</td>
                        <td className="iam-content-text">{c.text}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="iam-sub">Select a different learning outcome to see its aligned content.</p>
              </>
            )}
          </>
        )}
      </div>

      {readyForPlan && (
        <div className="iam-syllabus">
          {!syllabusRevealed ? (
            <button type="button" className="iam-reveal" onClick={() => setSyllabusRevealed(true)}>
              Show the full learning plan <ChevronDown />
            </button>
          ) : (
            <>
              <p className="iam-stage-label">Sequenced learning plan</p>
              <div className="iam-table-wrap">
                <table className="iam-table">
                  <colgroup>
                    <col className="iam-col-stage" />
                    <col className="iam-col-lesson" />
                    <col />
                    <col className="iam-col-res" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Stage</th>
                      <th>Lesson</th>
                      <th>Activity</th>
                      <th>Resources</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((g) =>
                      g.rows.map((row, ri) => (
                        <tr key={row.lesson}>
                          {ri === 0 && (
                            <td className="iam-stage-cell" rowSpan={g.rows.length}>
                              {g.outcome}
                            </td>
                          )}
                          <td>
                            <span className="iam-lesson-badge">{row.lesson}</span>
                          </td>
                          <td>{row.activity}</td>
                          <td>{row.resources}</td>
                        </tr>
                      ))
                    )}
                    <tr className="iam-row-assess">
                      <td className="iam-stage-cell">Assessment</td>
                      <td>
                        <span className="iam-lesson-badge">{LESSON_PLAN.length + 1}</span>
                      </td>
                      <td className="iam-assess-activity">
                        Write a response to the sickle cell case, bringing description, explanation, and evaluation together
                      </td>
                      <td>Case (recap)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="iam-plan-mobile">
                {LESSON_PLAN.map((row, i) => (
                  <div className="iam-plan-card" key={i}>
                    <div className="iam-plan-card-head">
                      <span className="iam-lesson-badge">{i + 1}</span>
                      <span className="iam-plan-stage">{row.outcome}</span>
                    </div>
                    <p className="iam-plan-activity">{row.activity}</p>
                    <p className="iam-plan-resources">{row.resources}</p>
                  </div>
                ))}
                <div className="iam-plan-card assess">
                  <div className="iam-plan-card-head">
                    <span className="iam-lesson-badge">{LESSON_PLAN.length + 1}</span>
                    <span className="iam-plan-stage">Assessment</span>
                  </div>
                  <p className="iam-plan-activity">
                    Write a response to the sickle cell case, bringing description, explanation, and evaluation together
                  </p>
                  <p className="iam-plan-resources">Case (recap)</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
