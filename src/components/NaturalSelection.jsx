import { useState, useRef, useEffect, useMemo } from "react";

// ── Model ───────────────────────────────────────────────────────
// A population of moths, each with a heritable colour trait `shade` in [0,1]
// (0 = pale, 1 = dark). The learner is the predator: they catch the moths they
// can spot in a timed window, so conspicuous moths (shade far from the bark)
// die and camouflaged ones survive. Survivors breed; offspring inherit the
// parent's shade plus a small mutation. Nothing decides who dies except the
// learner's own eye — selection is entirely emergent.
const N = 20;              // population size held constant each generation
const HUNT_MS = 7000;      // seconds of a single hunt
const MUT = 0.025;         // mutation spread on inheritance — small enough that no single
                            // generation's overshoot (see even-share breeding below) can
                            // carry the population far past the bark's shade and back
const SURVIVOR_FLOOR = 4;  // a hunt ends early once this few remain (no extinction)

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a, b, t) => a + (b - a) * t;
const meanShade = (arr) => arr.reduce((s, m) => s + m.shade, 0) / arr.length;

// A single warm-bark scale shared by both the moths and the bark, so that a
// moth's visibility is literally |shade − bark|, not a faked opacity.
function tone(s) {
  const L = { r: 214, g: 205, b: 187 };  // palest bark
  const D = { r: 41, g: 36, b: 29 };     // darkest bark
  return {
    r: Math.round(lerp(L.r, D.r, s)),
    g: Math.round(lerp(L.g, D.g, s)),
    b: Math.round(lerp(L.b, D.b, s)),
  };
}
function colourFor(s) {
  const { r, g, b } = tone(s);
  return `rgb(${r},${g},${b})`;
}

// ── deterministic per-id noise, so a given moth/bark's texture is stable
// across re-renders instead of flickering every time React repaints ──
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0;
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A tileable mottled-bark pattern: a handful of soft light/dark blotches around
// a base tone, generated once per (id, shade) pair. The SAME technique renders
// both the bark background and every moth's wings — a moth's shade close to the
// bark's shade produces near-identical grain, so it genuinely blends rather than
// sitting on top as a flat, differently-toned shape.
function BlotchPattern({ id, shade, size, blobs = 7 }) {
  // Blob layout is a pure function of `id` alone (memoized once), never of
  // `shade` — so flipping habitat recolours a moth's texture in place rather
  // than reshuffling it, and re-renders don't advance a shared RNG's state.
  const { spots, rot } = useMemo(() => {
    const rand = mulberry32(hashStr(id));
    const s = Array.from({ length: blobs }, () => ({
      cx: rand() * size, cy: rand() * size, r: size * (0.12 + rand() * 0.16),
      dark: rand() < 0.5, op: 0.07 + rand() * 0.1,
    }));
    return { spots: s, rot: (rand() - 0.5) * 12 };
  }, [id, size, blobs]);

  // Softer local tonal swing than the base/bark tonal range as a whole — enough
  // grain to read as bark, not so much that it out-shouts a genuine shade match.
  const base = tone(shade);
  const light = tone(clamp01(shade - 0.05));
  const dark = tone(clamp01(shade + 0.05));

  return (
    <pattern id={`p-${id}`} width={size} height={size} patternUnits="userSpaceOnUse" patternTransform={`rotate(${rot.toFixed(1)})`}>
      <rect width={size} height={size} fill={`rgb(${base.r},${base.g},${base.b})`} />
      {spots.map((s, i) => {
        const c = s.dark ? dark : light;
        const fill = `rgb(${c.r},${c.g},${c.b})`;
        return (
          <g key={i}>
            <circle cx={s.cx} cy={s.cy} r={s.r} fill={fill} opacity={s.op} />
            <circle cx={s.cx - size} cy={s.cy} r={s.r} fill={fill} opacity={s.op} />
            <circle cx={s.cx + size} cy={s.cy} r={s.r} fill={fill} opacity={s.op} />
            <circle cx={s.cx} cy={s.cy - size} r={s.r} fill={fill} opacity={s.op} />
            <circle cx={s.cx} cy={s.cy + size} r={s.r} fill={fill} opacity={s.op} />
          </g>
        );
      })}
    </pattern>
  );
}

const ENVS = {
  soot: {
    key: "soot", label: "Soot-darkened bark", shade: 0.83,
    blurb: "Bark blackened by industrial soot. Pale moths give themselves away; dark moths are harder to see.",
  },
};

let _uid = 0;
const nextId = () => ++_uid;

// A jittered grid rather than pure randomness — full coverage of the field
// with no dense clumps or empty gaps, so the scene reads as a considered
// branch of moths rather than a scatter of dots.
function gridPositions(n) {
  // Below the same breakpoint the rest of the layout treats as "mobile", the
  // moth button's fixed pixel size is actually bigger than a 5-column cell on
  // a phone-width field — every moth in a row would overlap its neighbours
  // even with zero jitter. Dropping to 4 wider columns (5 rows instead of 4)
  // gives each moth a cell it can actually fit inside.
  const isNarrow = typeof window !== "undefined" && window.matchMedia?.("(max-width:600px)").matches;
  const cols = isNarrow ? 4 : 5;
  const rows = Math.ceil(n / cols);
  const cellW = 100 / cols, cellH = 100 / rows;
  const rand = mulberry32((Date.now() ^ (Math.random() * 1e9)) >>> 0);
  // The moth button has a fixed pixel footprint (SVG + padding), but this grid
  // is pure percentage math with no idea how many pixels that is on a given
  // screen. On a narrow phone-width field the old jitter (up to 31% of a
  // cell's width from centre) could push a moth's edge past the field's own
  // boundary, or two neighbouring moths into each other. EDGE_MARGIN keeps
  // every position at least that far from the field edge regardless of field
  // size, and the jitter spread is pulled in slightly so neighbours have more
  // room between them too.
  const EDGE_MARGIN = 13;
  const clamp = (v) => Math.min(100 - EDGE_MARGIN, Math.max(EDGE_MARGIN, v));
  const out = [];
  for (let i = 0; i < n; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    out.push({
      x: clamp(col * cellW + cellW * 0.5 + (rand() - 0.5) * cellW * 0.4),
      y: clamp(row * cellH + cellH * 0.5 + (rand() - 0.5) * cellH * 0.4),
      rot: (rand() - 0.5) * 22,
    });
  }
  return out;
}

function makePop() {
  // A founding population with wide, undirected variation to select on.
  const spots = gridPositions(N);
  return Array.from({ length: N }, (_, i) => ({
    id: nextId(), shade: Math.random(), alive: true, x: spots[i].x, y: spots[i].y, rot: spots[i].rot,
  }));
}

const QUIZ = [
  { key: "antibiotic", label: "Antibiotic Resistance", desc: "An infection stops responding to the drug that used to clear it." },
  { key: "pesticide", label: "Pesticide-Proof Insects", desc: "A spray that wiped out crop pests barely dents them a few years later." },
  { key: "finch", label: "The Drought-Year Finches", desc: "After a dry year, an island's finches are measurably bigger-beaked." },
  { key: "all", label: "All of the Above", desc: "Every one of these is the same three-step mechanism you just ran." },
];

// Diagnostic MC quiz — right/wrong feedback, distinct from the exploratory
// click-to-reveal QUIZ above. Ported from the same pattern used in
// ReactionRateSimulator.jsx, restyled to this asset's own `.ns-` palette.
const CYU_QUESTIONS = [
  {
    prompt: "Across the generations you ran, what actually changed?",
    options: [
      { text: "Individual moths gradually darkened their own wings to hide better", correct: false, feedback: "No moth ever changed colour — each was born its shade and kept it for life. What changed was the make-up of the whole population." },
      { text: "The population's average colour shifted, even though no single moth changed", correct: true, feedback: "Correct. Darker moths survived and bred more often, so each new generation had more of them. The population moved, not any individual." },
      { text: "The bark changed to match the moths", correct: false, feedback: "The bark's shade stayed fixed. It was the moth population that shifted toward the bark, because the visible moths were the ones caught." },
    ],
  },
  {
    prompt: "Why did the darker moths come to dominate?",
    options: [
      { text: "They needed to survive, so they adapted to the soot", correct: false, feedback: "Nothing in the moths \"tried\" to adapt. Darker moths simply happened to be harder to spot, so more survived to breed — no intent required." },
      { text: "They were harder to spot against the dark bark, so more survived to breed and pass on their colouring", correct: true, feedback: "Correct. That's differential survival: the camouflaged moths left more offspring, and offspring inherit their parents' shade." },
      { text: "The bird preferred the taste of pale moths", correct: false, feedback: "It wasn't taste, it was visibility. Pale moths stood out against the soot-darkened bark and were easier to catch." },
    ],
  },
];

const OPTION_LETTERS = ["A", "B", "C"];

// Controlled by the parent (selected/onSelect), not local state — the
// "answer all questions to unlock the takeaway" gate needs to know from
// outside whether each question has been answered.
function CyuQuestion({ index, question, selected, onSelect }) {
  const answered = selected !== null;
  const answeredCorrect = answered && question.options[selected].correct;

  return (
    <div className="ns-cyu-q">
      <div className="ns-cyu-head">
        <span className="ns-cyu-num">{index + 1}</span>
        <p className="ns-cyu-prompt">{question.prompt}</p>
      </div>
      {question.options.map((opt, oi) => {
        const isSelected = selected === oi;
        const stateClass = isSelected ? (opt.correct ? " selected correct" : " selected incorrect") : "";
        return (
          <button
            key={oi}
            type="button"
            className={`ns-cyu-opt${stateClass}`}
            onClick={() => onSelect(oi)}
          >
            <span className="ns-cyu-opt-marker">
              {isSelected ? (opt.correct ? "✓" : "✕") : OPTION_LETTERS[oi]}
            </span>
            <span className="ns-cyu-opt-text">{opt.text}</span>
          </button>
        );
      })}
      {answered && (
        <div className={`ns-cyu-feedback ${answeredCorrect ? "correct" : "incorrect"}`}>
          <span className="ns-cyu-feedback-icon">{answeredCorrect ? "✓" : "✕"}</span>
          <span>{question.options[selected].feedback}</span>
        </div>
      )}
    </div>
  );
}

const ChevronDown = () => (
  <svg className="ns-chev" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Moth glyph — filled with its own blotch pattern, no stroke, no shadow
// while hunting: a real colour/texture match is the only thing that hides it. ──
function Moth({ patternId }) {
  const wing = (
    <>
      <path d="M20 12 C10 1 1 4 2 12 C2.6 17.5 12 16 20 14 Z" />
      <path d="M20 16 C12 15 4 18 6 24.5 C8 29 16 24 20 20 Z" />
    </>
  );
  const fill = `url(#p-${patternId})`;
  return (
    <svg viewBox="0 0 40 34" width="34" height="29" aria-hidden="true">
      <g fill={fill}>
        <g>{wing}</g>
        <g transform="translate(40,0) scale(-1,1)">{wing}</g>
        <ellipse cx="20" cy="17" rx="2.4" ry="8.6" fill={fill} />
      </g>
    </svg>
  );
}

export default function NaturalSelection() {
  const envKey = "soot"; // only one habitat now — nothing to toggle between
  const [pop, setPop] = useState(makePop);
  const [generation, setGeneration] = useState(1);
  const [phase, setPhase] = useState("ready");        // ready · hunting · tallied
  const [timeLeft, setTimeLeft] = useState(HUNT_MS);
  const [history, setHistory] = useState(() => [
    { gen: 1, mean: meanShade(pop), env: "soot" },
  ]);
  const [revealedQuiz, setRevealedQuiz] = useState(new Set());
  // Check-your-understanding gate: available from page load like the
  // reaction-rate asset's quiz (not tied to generation count), and itself
  // gates the takeaway/real-world sections — those only unlock once every
  // question here has been answered.
  const [showQuestions, setShowQuestions] = useState(false);
  const [cyuAnswers, setCyuAnswers] = useState(() => CYU_QUESTIONS.map(() => null));
  const [takeawayRevealed, setTakeawayRevealed] = useState(false);
  const allCyuAnswered = cyuAnswers.every((a) => a !== null);

  const env = ENVS[envKey];
  const rafRef = useRef(null);
  const huntStart = useRef(0);

  const aliveCount = pop.reduce((n, m) => n + (m.alive ? 1 : 0), 0);
  const caughtCount = N - aliveCount;
  const popMean = meanShade(pop);
  const camouflage = Math.round((1 - Math.abs(popMean - env.shade)) * 100);

  // ── the hunt clock ──
  useEffect(() => {
    if (phase !== "hunting") return;
    let active = true;
    const tick = () => {
      if (!active) return;
      const left = Math.max(0, HUNT_MS - (performance.now() - huntStart.current));
      setTimeLeft(left);
      if (left <= 0) { setPhase("tallied"); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { active = false; if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  // end a hunt early once the survivors thin out, so the population can't crash
  useEffect(() => {
    if (phase === "hunting" && aliveCount <= SURVIVOR_FLOOR) setPhase("tallied");
  }, [phase, aliveCount]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const startHunt = () => {
    if (phase !== "ready") return;
    huntStart.current = performance.now();
    setTimeLeft(HUNT_MS);
    setPhase("hunting");
  };

  const catchMoth = (id) => {
    if (phase !== "hunting") return;
    setPop((prev) => prev.map((m) => (m.id === id ? { ...m, alive: false } : m)));
  };

  const breed = () => {
    const survivors = pop.filter((m) => m.alive);
    if (survivors.length === 0) return;
    const spots = gridPositions(N);
    // Every survivor gets a roughly equal share of the next generation, rather
    // than each of the N offspring independently re-rolling "who's my parent?"
    // — pure random-with-replacement lets a handful of survivors dominate by
    // chance alone, which (combined with whichever colour extreme happened to
    // be easiest to spot that round) can overshoot the population's average
    // past the bark's shade and back, generation after generation, instead of
    // settling. Survival still decides who breeds at all; this only removes
    // the extra luck in how much each survivor breeds.
    const pool = [];
    while (pool.length < N) pool.push(...[...survivors].sort(() => Math.random() - 0.5));
    const next = Array.from({ length: N }, (_, i) => {
      const parent = pool[i];
      const shade = clamp01(parent.shade + (Math.random() - 0.5) * 2 * MUT);
      return { id: nextId(), shade, alive: true, x: spots[i].x, y: spots[i].y, rot: spots[i].rot };
    });
    const g = generation + 1;
    setPop(next);
    setGeneration(g);
    setHistory((h) => [...h, { gen: g, mean: meanShade(next), env: envKey }]);
    setPhase("ready");
  };

  const restart = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const fresh = makePop();
    setPop(fresh);
    setGeneration(1);
    setPhase("ready");
    setTimeLeft(HUNT_MS);
    setHistory([{ gen: 1, mean: meanShade(fresh), env: "soot" }]);
  };

  const toggleQuiz = (key) => setRevealedQuiz((prev) => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  // tally copy after a hunt
  const survivorMean = aliveCount > 0 ? meanShade(pop.filter((m) => m.alive)) : popMean;
  const survivorHidden = 1 - Math.abs(survivorMean - env.shade);
  const wholeHidden = 1 - Math.abs(popMean - env.shade);
  const gotHidden = survivorHidden > wholeHidden + 0.01;

  const rounds = generation - 1;

  // ── generations chart geometry ──
  const chart = useMemo(() => {
    const W = 100, padX = 7, padTop = 12, padBot = 12;
    const n = history.length;
    const xAt = (i) => (n <= 1 ? padX : padX + (i / (n - 1)) * (W - 2 * padX));
    const yAt = (s) => padTop + s * (100 - padTop - padBot);
    const mean = history.map((e, i) => `${xAt(i)},${yAt(e.mean)}`).join(" ");
    const target = history.map((e, i) => `${xAt(i)},${yAt(ENVS[e.env].shade)}`).join(" ");
    const dots = history.map((e, i) => ({ x: xAt(i), y: yAt(e.mean), c: colourFor(e.mean) }));
    return { mean, target, dots };
  }, [history]);

  return (
    <div className="ns-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        .ns-root{
          --paper:#F4F0E7;--card:#FCFAF4;--border:#E4DDCE;--line:#EFE9DC;
          --ink:#23281F;--muted:#6E6B5E;--soft:#8A8677;
          --accent:#3B7A54;--accent-deep:#2E6242;--accent-wash:#EDF3EC;--accent-line:#CFE1D2;
          --amber:#9A6A1E;--amber-wash:#F7EFDD;--amber-line:#E7D3A6;
          --stagenight:#1B1A16;
          background:var(--paper);color:var(--ink);font-family:'Inter',system-ui,sans-serif;
          padding:28px 22px 14px;min-height:100%;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
        .ns-root *{box-sizing:border-box;}
        .mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums;}
        .ns-card{background:var(--card);border:1px solid var(--border);border-radius:15px;padding:22px;margin-top:18px;
          box-shadow:0 1px 2px rgba(40,45,30,.05);}
        .ns-card.first{margin-top:0;}
        .ns-eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);font-weight:700;margin-bottom:10px;}
        .ns-root .ns-title{font-family:'Poppins',sans-serif;font-size:20px;font-weight:600;letter-spacing:-.01em;line-height:1.05;margin:0 0 12px;color:var(--ink);}
        .ns-lede{font-size:14.5px;line-height:1.62;color:#40453A;} .ns-lede i{color:var(--ink);font-style:italic;} .ns-lede b{color:var(--ink);font-weight:600;}
        .ns-tryit{background:var(--accent-wash);border:1px solid var(--accent-line);border-radius:14px;padding:19px 21px;margin-top:20px;}
        .ns-tryit-h{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-deep);font-weight:700;margin-bottom:15px;}
        .ns-steps{display:flex;flex-direction:column;gap:13px;}
        .ns-step{display:flex;gap:12px;align-items:flex-start;}
        .ns-num{flex:0 0 24px;width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;font-size:12px;font-weight:700;
          display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;}
        .ns-step div{font-size:14.5px;line-height:1.55;color:#37432F;padding-top:2px;} .ns-step b{color:var(--ink);}
        .ns-note{margin-top:15px;padding-top:13px;border-top:1px solid var(--accent-line);font-size:13.5px;line-height:1.55;color:#3C4A34;}

        .ns-habitat-h{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:600;margin-bottom:9px;}
        .ns-habitat-blurb{margin-top:11px;font-size:13.5px;line-height:1.55;color:#4A4A3E;}
        .ns-habitat-blurb b{color:var(--ink);}

        .ns-hud{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:16px;flex-wrap:wrap;}
        .ns-gen{font-size:13px;color:var(--muted);font-weight:600;} .ns-gen b{color:var(--ink);}
        .ns-stats{display:flex;gap:16px;font-size:12px;color:var(--soft);flex-wrap:wrap;}
        .ns-stats b{color:var(--accent-deep);font-weight:700;}
        .ns-stats .warn{color:var(--amber);}

        .ns-field{position:relative;margin-top:12px;border-radius:12px;height:344px;overflow:hidden;
          box-shadow:inset 0 0 0 1px rgba(0,0,0,.10), inset 0 12px 34px rgba(0,0,0,.16);}
        .ns-field.hunting{cursor:crosshair;}
        .ns-bark-svg{position:absolute;inset:0;display:block;}
        .ns-field-light{position:absolute;inset:0;pointer-events:none;mix-blend-mode:soft-light;
          background:
            radial-gradient(55% 45% at 26% 18%, rgba(255,255,255,.24), transparent 62%),
            radial-gradient(48% 40% at 82% 86%, rgba(0,0,0,.22), transparent 65%);}
        .ns-moth{position:absolute;transform:translate(-50%,-50%) rotate(var(--r,0deg));appearance:none;border:none;background:none;padding:6px;margin:0;line-height:0;
          filter:blur(.55px);transition:transform .2s ease;}
        .ns-field.hunting .ns-moth{cursor:crosshair;}
        .ns-moth:not(:disabled){cursor:pointer;}
        .ns-moth:disabled{cursor:default;}
        .ns-moth:hover:not(:disabled){transform:translate(-50%,-50%) rotate(var(--r,0deg)) scale(1.12);}
        .ns-moth:focus-visible{outline:2px solid #fff;outline-offset:1px;border-radius:6px;}
        .ns-moth.caught{animation:ns-flee .46s cubic-bezier(.3,.6,.4,1) forwards;pointer-events:none;}
        .ns-moth.survivor{filter:drop-shadow(0 1px 3px rgba(0,0,0,.35));}
        .ns-moth.survivor svg{outline:2px solid rgba(123,214,160,.95);outline-offset:2px;border-radius:8px;}
        @keyframes ns-flee{
          0%{transform:translate(-50%,-50%) rotate(var(--r,0deg)) scale(1);opacity:1;}
          35%{transform:translate(-50%,-72%) rotate(calc(var(--r,0deg) + 14deg)) scale(1.08);opacity:1;}
          100%{transform:translate(-50%,-160%) rotate(calc(var(--r,0deg) - 22deg)) scale(.4);opacity:0;}
        }
        .ns-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.82);
          font-size:14px;font-weight:600;text-shadow:0 1px 3px rgba(0,0,0,.6);pointer-events:none;text-align:center;padding:0 24px;}

        .ns-clock{position:absolute;left:12px;right:12px;bottom:12px;height:8px;border-radius:5px;background:rgba(0,0,0,.35);overflow:hidden;pointer-events:none;}
        .ns-clock span{display:block;height:100%;background:linear-gradient(90deg,#7BD6A0,#4FB37A);border-radius:5px;}
        .ns-clocktag{position:absolute;left:12px;top:12px;background:rgba(0,0,0,.5);color:#fff;font-size:11px;font-weight:700;
          padding:4px 10px;border-radius:20px;pointer-events:none;letter-spacing:.02em;}

        .ns-controls{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:15px;}
        .ns-btn{appearance:none;border-radius:9px;padding:11px 18px;font-family:inherit;font-weight:600;font-size:13.5px;cursor:pointer;
          border:1px solid var(--border);background:var(--card);color:var(--ink);transition:border-color .15s,transform .08s,background .15s;}
        .ns-btn:hover{border-color:var(--ink);} .ns-btn:active{transform:translateY(1px);}
        .ns-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px;}
        .ns-btn.solid{background:var(--accent);border-color:var(--accent);color:#fff;} .ns-btn.solid:hover{background:var(--accent-deep);border-color:var(--accent-deep);}
        .ns-btn:disabled{opacity:.45;cursor:not-allowed;}
        .ns-btn.ghost{background:transparent;color:var(--muted);border-color:transparent;}
        .ns-btn.ghost:hover{color:var(--ink);border-color:var(--border);}
        .ns-hint{font-size:12.5px;color:var(--muted);margin-top:9px;line-height:1.5;}

        .ns-tally{margin-top:15px;background:var(--accent-wash);border:1px solid var(--accent-line);border-radius:12px;padding:15px 17px;
          font-size:14px;line-height:1.6;color:#374433;}
        .ns-tally b{color:var(--ink);} .ns-tally .k{color:var(--accent-deep);font-weight:700;}

        .ns-chart-wrap{margin-top:20px;padding-top:16px;border-top:1px dashed var(--border);}
        .ns-chart-h{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:10px;}
        .ns-chart-h .t{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:600;}
        .ns-legend{display:flex;gap:14px;font-size:11.5px;color:var(--soft);flex-wrap:wrap;}
        .ns-legend span{display:inline-flex;align-items:center;gap:6px;}
        .ns-swatch{width:16px;height:0;border-top:3px solid var(--accent);border-radius:2px;}
        .ns-swatch.dash{border-top:2px dashed var(--soft);}
        .ns-chart{position:relative;display:flex;gap:8px;}
        .ns-yax{display:flex;flex-direction:column;justify-content:space-between;font-size:10px;color:var(--soft);padding:2px 0 14px;text-align:right;width:46px;flex:0 0 46px;}
        .ns-plot{flex:1;height:150px;background:var(--paper);border:1px solid var(--border);border-radius:8px;overflow:hidden;}
        .ns-plot svg{display:block;width:100%;height:100%;}
        .ns-xax{margin-left:54px;font-size:10.5px;color:var(--soft);margin-top:6px;}

        .ns-takeaway{font-size:14.5px;line-height:1.68;color:#3B4234;}
        .ns-takeaway p{margin:0 0 13px;} .ns-takeaway p:last-child{margin-bottom:0;} .ns-takeaway b{color:var(--ink);}
        .ns-pull{margin:0 0 16px;padding:20px 24px;background:var(--accent-wash);
          border-radius:14px;font-family:'Fraunces',Georgia,serif;font-size:16px;line-height:1.55;font-weight:500;color:var(--ink);}
        .ns-concept{margin:16px 0;padding:16px 18px;background:var(--amber-wash);border:1px solid var(--amber-line);border-radius:12px;}
        .ns-concept-term{font-weight:700;color:var(--amber);font-family:'Fraunces',Georgia,serif;font-size:15px;}
        .ns-ingredients{list-style:none;margin:12px 0 0;padding:0;display:flex;flex-direction:column;gap:9px;}
        .ns-ingredients li{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.5;color:#5A4A28;}
        .ns-ing-b{flex:0 0 auto;width:22px;height:22px;border-radius:6px;background:var(--amber);color:#fff;font-size:11px;font-weight:700;
          display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;margin-top:1px;}
        .ns-ing-b + span b{color:#3d2f12;}

        .ns-quizhd{font-family:'Fraunces',Georgia,serif;font-size:20px;font-weight:600;margin:0 0 8px;color:var(--ink);}
        .ns-quizprompt{font-size:14px;color:#40453A;margin:0 0 16px;line-height:1.5;}
        .ns-quizitem{margin-bottom:10px;}
        .ns-quizopt{display:block;width:100%;text-align:left;background:var(--card);border:1.5px solid var(--border);border-radius:10px;padding:13px 15px;cursor:pointer;transition:border-color .15s,background .15s;}
        .ns-quizopt:hover{border-color:var(--accent);}
        .ns-quizopt.open{border-color:var(--accent);background:var(--accent-wash);border-bottom-left-radius:0;border-bottom-right-radius:0;}
        .ns-quizopt:focus-visible{outline:2px solid var(--accent);outline-offset:2px;}
        .ns-quizlab{font-size:14px;font-weight:600;color:var(--ink);display:block;}
        .ns-quizdesc{font-size:13px;color:var(--muted);margin-top:3px;display:block;}
        .ns-quizreveal{background:var(--paper);border:1.5px solid var(--accent);border-top:none;border-radius:0 0 10px 10px;padding:14px 15px;font-size:13.5px;line-height:1.6;color:#3B4234;margin-top:-1px;}
        .ns-quizreveal b{color:var(--ink);} .ns-quizreveal ul{margin:8px 0;padding-left:20px;} .ns-quizreveal li{margin-bottom:6px;}

        .ns-cyu-q{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px 22px;margin-bottom:14px;}
        .ns-cyu-q:last-child{margin-bottom:0;}
        .ns-cyu-head{display:flex;gap:12px;align-items:flex-start;margin-bottom:16px;}
        .ns-cyu-num{flex:0 0 26px;width:26px;height:26px;border-radius:50%;background:var(--accent);color:#fff;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px;}
        .ns-cyu-prompt{font-size:14.5px;font-weight:600;margin:0;line-height:1.5;color:var(--ink);}
        .ns-cyu-opt{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:11px 14px;margin-bottom:8px;cursor:pointer;font-size:13.5px;font-family:inherit;color:var(--ink);transition:border-color .12s ease,transform .1s ease;}
        .ns-cyu-opt:last-of-type{margin-bottom:0;}
        .ns-cyu-opt:hover{border-color:var(--accent);transform:translateX(2px);}
        .ns-cyu-opt:focus-visible{outline:2px solid var(--accent);outline-offset:2px;}
        .ns-cyu-opt-marker{flex:0 0 22px;width:22px;height:22px;border-radius:50%;background:var(--paper);border:1.5px solid var(--border);color:var(--muted);font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;transition:all .12s ease;}
        .ns-cyu-opt-text{flex:1;}
        .ns-cyu-opt.selected{transform:none;}
        .ns-cyu-opt.selected.correct{background:#E8F5EC;border-color:#4CAF6D;}
        .ns-cyu-opt.selected.correct .ns-cyu-opt-marker{background:#4CAF6D;border-color:#4CAF6D;color:#fff;}
        .ns-cyu-opt.selected.incorrect{background:#FBEAEA;border-color:#D9534F;}
        .ns-cyu-opt.selected.incorrect .ns-cyu-opt-marker{background:#D9534F;border-color:#D9534F;color:#fff;}
        .ns-cyu-feedback{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.55;margin-top:12px;padding:12px 14px;border-radius:10px;}
        .ns-cyu-feedback-icon{flex:0 0 20px;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;margin-top:1px;}
        .ns-cyu-feedback.correct{color:#2C7A47;background:#E8F5EC;}
        .ns-cyu-feedback.correct .ns-cyu-feedback-icon{background:#4CAF6D;}
        .ns-cyu-feedback.incorrect{color:#A83B36;background:#FBEAEA;}
        .ns-cyu-feedback.incorrect .ns-cyu-feedback-icon{background:#D9534F;}

        .ns-reveal{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;
          background:var(--card);border:1px dashed var(--border);border-radius:12px;padding:13px 16px;
          font-family:inherit;font-size:14px;font-weight:600;color:var(--accent-deep);cursor:pointer;
          transition:background .14s ease,border-color .14s ease;}
        .ns-reveal:hover{background:var(--accent-wash);border-color:var(--accent);}
        .ns-reveal:focus-visible{outline:2px solid var(--accent);outline-offset:2px;}
        .ns-reveal:disabled{opacity:.45;cursor:not-allowed;}
        .ns-reveal .ns-chev{transition:transform .16s ease;}
        .ns-reveal:hover .ns-chev{transform:translateY(2px);}
        .ns-cyu-progress{font-size:12.5px;color:var(--muted);text-align:center;margin:14px 0 0;}
        .ns-cyu-unlock{margin-top:14px;}

        .ns-footer{margin-top:24px;padding:15px 2px 6px;border-top:1px solid var(--border);font-size:12px;color:var(--muted);line-height:1.6;display:flex;gap:10px;align-items:flex-start;}
        .ns-footer b{color:var(--ink);} .ns-footer-icon{flex:0 0 auto;margin-top:2px;color:var(--muted);}

        /* ns-root's padding goes to zero on every side, not just
           horizontally — the asset-mount wrapper around this component clips
           to a 16px rounded corner, so any leftover top/bottom padding here
           left a tinted, separately-rounded strip poking out above the first
           card (whose own margin-top is already 0). At 0 padding, that
           card's own rounded top sits flush with asset-mount's, so there's
           a single corner instead of two stacked ones — and the tint still
           reads as a page tone in the gaps between the cards below it. */
        @media(max-width:600px){
          .ns-root{padding:0;}
          .ns-card{padding:14px;}
          .ns-field{height:300px;}
          .ns-yax{width:40px;flex:0 0 40px;} .ns-xax{margin-left:48px;}
        }
        @media(prefers-reduced-motion:reduce){.ns-moth{transition:none;} .ns-moth.caught{animation-duration:.01s;}}
      `}</style>

      {/* ── Intro ── */}
      <div className="ns-card first">
        <h1 className="ns-title">Natural Selection</h1>
        <p className="ns-lede">
          Two hundred years ago, almost every peppered moth in England was pale and speckled. It was perfect camouflage
          against lichen-covered bark, where the moths liked to rest. When factories were built in the industrial era, soot soon blackened the trees and the light-coloured moths were easily visible to birds, who began to hunt and eat the ones they could see.
        </p>
        <p className="ns-lede">
          In this explorable, <b>you</b> will assume the role of the hungry bird and hunt a population of moths. After the hunt, breed the ones that survive and watch how the moth population adapts, generation by generation.
        </p>

        <div className="ns-tryit">
          <div className="ns-tryit-h">What to do</div>
          <div className="ns-steps">
            <div className="ns-step">
              <span className="ns-num">1</span>
              <div><b>Hunt.</b> Press <b>Release the bird</b>, then click every moth you can spot before the clock runs
                out.</div>
            </div>
            <div className="ns-step">
              <span className="ns-num">2</span>
              <div><b>Breed the survivors.</b> The moths you missed live on and reproduce. Their offspring inherit their
                colouring, give or take a little variation.</div>
            </div>
            <div className="ns-step">
              <span className="ns-num">3</span>
              <div><b>Repeat.</b> Hunt again. This time the moths might be slightly harder to spot!</div>
            </div>
          </div>
          <div className="ns-note">Run the simulation at least twice to see the population change.</div>
        </div>
      </div>

      {/* ── The interactive ── */}
      <div className="ns-card">
        <div className="ns-habitat-h">Habitat</div>
        <div className="ns-habitat-blurb">{env.blurb}</div>

        <div className="ns-hud">
          <span className="ns-gen">Generation <b>{generation}</b></span>
          <div className="ns-stats">
            <span>Alive <b>{aliveCount}</b>/{N}</span>
            <span>Caught <b>{caughtCount}</b></span>
            <span className={camouflage < 55 ? "warn" : undefined}>Population hidden <b>{camouflage}%</b></span>
          </div>
        </div>

        <div className={`ns-field ${phase === "hunting" ? "hunting" : ""}`}>
          <svg className="ns-bark-svg" width="100%" height="100%" viewBox="0 0 600 344" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <BlotchPattern id="bark" shade={env.shade} size={46} blobs={9} />
              {pop.map((m) => <BlotchPattern key={m.id} id={`m${m.id}`} shade={m.shade} size={9} blobs={6} />)}
            </defs>
            <rect width="600" height="344" fill="url(#p-bark)" />
          </svg>
          <div className="ns-field-light" />

          {pop.map((m) => {
            const isSurvivor = phase === "tallied" && m.alive;
            return (
              <button
                key={m.id}
                className={`ns-moth ${!m.alive ? "caught" : ""} ${isSurvivor ? "survivor" : ""}`}
                style={{ left: `${m.x}%`, top: `${m.y}%`, "--r": `${m.rot}deg` }}
                disabled={phase !== "hunting" || !m.alive}
                aria-label={phase === "hunting" ? "Catch moth" : "Moth"}
                onClick={() => catchMoth(m.id)}
              >
                <Moth patternId={`m${m.id}`} />
              </button>
            );
          })}

          {phase === "hunting" && (
            <>
              <div className="ns-clocktag mono">{(timeLeft / 1000).toFixed(1)}s</div>
              <div className="ns-clock"><span style={{ width: `${(timeLeft / HUNT_MS) * 100}%` }} /></div>
            </>
          )}
          {phase === "tallied" && aliveCount <= SURVIVOR_FLOOR && (
            <div className="ns-empty">The rest escaped into the canopy.</div>
          )}
        </div>

        <div className="ns-controls">
          {phase === "ready" && (
            <button className="ns-btn solid" onClick={startHunt}>Release the bird →</button>
          )}
          {phase === "hunting" && (
            <button className="ns-btn" onClick={() => setPhase("tallied")}>End hunt early</button>
          )}
          {phase === "tallied" && (
            <button className="ns-btn solid" onClick={breed}>Breed the survivors →</button>
          )}
          {generation > 1 || phase !== "ready" ? (
            <button className="ns-btn ghost" onClick={restart}>Start over</button>
          ) : null}
        </div>

        {phase === "ready" && generation === 1 && (
          <div className="ns-hint">Click on the moths you can spot. Well-camouflaged moths are hard to see, so hunt fast!</div>
        )}

        {phase === "tallied" && (
          <div className="ns-tally">
            You caught <b>{caughtCount}</b> {caughtCount === 1 ? "moth" : "moths"}. The <b>{aliveCount}</b> survivors
            were, on average,{" "}
            {gotHidden
              ? <>a <span className="k">better match</span> for the bark than the population you started the hunt with. The conspicuous ones paid for standing out.</>
              : <>about as hidden as the rest. This time your eye didn't favour any particular colour much.</>}{" "}
            Breed them and their colouring carries into the next generation.
          </div>
        )}

        {/* generations chart */}
        {history.length > 1 && (
          <div className="ns-chart-wrap">
            <div className="ns-chart-h">
              <span className="t">Population colour, generation by generation</span>
              <div className="ns-legend">
                <span><span className="ns-swatch" /> population average</span>
                <span><span className="ns-swatch dash" /> the bark</span>
              </div>
            </div>
            <div className="ns-chart">
              <div className="ns-yax"><span>paler</span><span>darker</span></div>
              <div className="ns-plot">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline points={chart.target} fill="none" stroke="var(--soft)" strokeWidth="0.9"
                    strokeDasharray="2.4 2.4" vectorEffect="non-scaling-stroke" />
                  <polyline points={chart.mean} fill="none" stroke="var(--accent)" strokeWidth="2.4"
                    vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
                  {chart.dots.map((d, i) => (
                    <circle key={i} cx={d.x} cy={d.y} r="2.4" fill={d.c} stroke="var(--accent)" strokeWidth="1"
                      vectorEffect="non-scaling-stroke" />
                  ))}
                </svg>
              </div>
            </div>
            <div className="ns-xax">Generation 1 → {generation}. The average moth is chasing the colour of the bark.</div>
          </div>
        )}
      </div>

      {/* ── Check your understanding ── */}
      <div className="ns-card">
        {!showQuestions ? (
          <button type="button" className="ns-reveal" onClick={() => setShowQuestions(true)}>
            Show the check-your-understanding questions <ChevronDown />
          </button>
        ) : (
          <>
            <div className="ns-eyebrow">Check your understanding</div>
            <p className="ns-quizprompt">Answer these questions based on what you noticed in the hunt.</p>
            {CYU_QUESTIONS.map((q, qi) => (
              <CyuQuestion
                key={qi}
                index={qi}
                question={q}
                selected={cyuAnswers[qi]}
                onSelect={(oi) => setCyuAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
              />
            ))}
            {!takeawayRevealed && (
              allCyuAnswered ? (
                <button type="button" className="ns-reveal ns-cyu-unlock" onClick={() => setTakeawayRevealed(true)}>
                  Show the takeaway <ChevronDown />
                </button>
              ) : (
                <p className="ns-cyu-progress">Answer all {CYU_QUESTIONS.length} questions to unlock the takeaway.</p>
              )
            )}
          </>
        )}
      </div>

      {/* ── Takeaway ── */}
      {takeawayRevealed && (
        <div className="ns-card">
          <div className="ns-eyebrow">The takeaway</div>
          <blockquote className="ns-pull">
            Not one moth ever changed its colour. Every moth was born its shade and died its shade. What changed,
            across {rounds} {rounds === 1 ? "round" : "rounds"} of hunting, was the <i>population</i>.
          </blockquote>
          <div className="ns-takeaway">
            <p>
              The moths that were better camouflaged survived more often, bred, and passed their
              colouring on. When that happened a few times over, the entire moth population became better camouflaged without any one moth ever trying or needing to adapt.
            </p>
            <div className="ns-concept">
              <span className="ns-concept-term">Natural selection</span> runs whenever three plain facts are all true at
              once:
              <ul className="ns-ingredients">
                <li><span className="ns-ing-b">1</span><span><b>Variation:</b> individuals differ (your moths came in every shade).</span></li>
                <li><span className="ns-ing-b">2</span><span><b>Heredity:</b> offspring resemble their parents (survivors' colouring was inherited).</span></li>
                <li><span className="ns-ing-b">3</span><span><b>Differential survival:</b> some variants leave more offspring than others (the hidden ones lived to breed).</span></li>
              </ul>
            </div>
            <p>
              That's the entire mechanism. The population didn't march toward black because black is objectively "better";
              it did because black was what disappeared against this particular bark. The "best" colour was never fixed;
              it's always just whatever the surroundings happen to reward. <b>Evolution is not individuals improving. It is
              populations shifting, one lucky survivor at a time.</b>
            </p>
          </div>
        </div>
      )}

      {/* ── Beyond the field ── */}
      {takeawayRevealed && (
        <div className="ns-card">
          <div className="ns-eyebrow">Beyond the field</div>
          <div className="ns-quizhd">Natural selection across the ecosystem.</div>
          <p className="ns-quizprompt">Which of these is driven by the exact three-step process you just ran? Click one to reveal the mechanism.</p>

          {QUIZ.map((q) => (
            <div key={q.key} className="ns-quizitem">
              <button className={`ns-quizopt ${revealedQuiz.has(q.key) ? "open" : ""}`} onClick={() => toggleQuiz(q.key)}>
                <span className="ns-quizlab">{q.label}</span>
                <span className="ns-quizdesc">{q.desc}</span>
              </button>
              {revealedQuiz.has(q.key) && (
                <div className="ns-quizreveal">
                  {q.key === "antibiotic" && (
                    <p><b>Yes, and it's life-or-death.</b> A few bacteria in the colony already carry a mutation that
                    happens to blunt the drug. The antibiotic is the predator: it kills the susceptible billions and
                    leaves the resistant few. Those few breed, and within days the infection is descended almost entirely
                    from survivors. The drug didn't <i>create</i> resistance; it selected for it, exactly like your bird
                    selecting for camouflage.</p>
                  )}
                  {q.key === "pesticide" && (
                    <p><b>Correct.</b> Spray a field and you kill every insect except the handful whose biochemistry
                    already shrugs it off. They inherit the farm, and their resistant offspring inherit the resistance.
                    Reach for the same spray a few generations later and you're dosing a population bred from the only
                    bugs it never worked on.</p>
                  )}
                  {q.key === "finch" && (
                    <p><b>Correct, and it was measured in the wild.</b> On Daphne Major, a drought left only big, tough
                    seeds. Finches with slightly deeper beaks could crack them; small-beaked birds starved. In a single
                    generation the average beak got measurably bigger, not because any bird's beak grew, but because the
                    big-beaked birds were the ones that lived to breed. Peter and Rosemary Grant watched it happen.</p>
                  )}
                  {q.key === "all" && (
                    <>
                      <p><b>Exactly.</b> Variation, heredity, and differential survival aren't a moth thing. They're a
                      <i> living-thing</i> thing. Wherever those three are true, selection is already running:</p>
                      <ul>
                        <li><b>Medicine:</b> antibiotic- and antiviral-resistant microbes, and cancer cells that outlast chemotherapy.</li>
                        <li><b>Agriculture:</b> pesticide-proof insects and herbicide-proof weeds.</li>
                        <li><b>The wild:</b> beak size, coat colour, running speed, all retuned every generation by whatever the environment rewards.</li>
                      </ul>
                      <p>Once you can see the mechanism, you spot it everywhere, and you understand why "just use more of the
                      same drug" so often breeds the very thing it was meant to kill.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="ns-footer">
        <svg className="ns-footer-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3.6C8 3.6 6.6 2.6 3.7 2.6C2.9 2.6 2.3 3.2 2.3 4V11.8C2.3 11.8 3.7 11.4 5.6 11.4C7 11.4 8 12.4 8 12.4M8 3.6V12.4M8 3.6C8 3.6 9.4 2.6 12.3 2.6C13.1 2.6 13.7 3.2 13.7 4V11.8C13.7 11.8 12.3 11.4 10.4 11.4C9 11.4 8 12.4 8 12.4"
            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          The reversing moth is the true story of industrial melanism in the peppered moth
          (<i>Biston betularia</i>), studied by H. B. D. Kettlewell in the 1950s.
        </div>
      </div>
    </div>
  );
}
