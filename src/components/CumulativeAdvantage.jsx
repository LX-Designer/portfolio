import { useState, useRef, useMemo, useEffect } from "react";

// Verbatim port of the InquiryLabs "The Making of a Hit" explorable
// (asset-library/src/explorables/hit-engine/HitEngine.jsx), following the same
// approach as NaturalSelection.jsx — a finished, self-contained explorable that
// carries its own scoped palette (the `.he-` prefix / --accent indigo tokens),
// not the site's design tokens. Only the exported function name changed
// (HitEngine → CumulativeAdvantage) to match the portfolio's naming; the
// simulation and styling are untouched. Rendered client-only, like the other
// interactive islands.

// ── Model ───────────────────────────────────────────────────────
const N = 16, P = 600, CFOLLOW = 1, GFOLLOW = 1.3;
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function makeWorld(seed) {
  const rand = mulberry32(seed); const coin = new Array(P), pick = new Array(P);
  for (let i = 0; i < P; i++) { coin[i] = rand(); pick[i] = rand(); }
  return { coin, pick };
}
function pickOne(plays, coinVal, pickVal, c) {
  if (coinVal < c) {
    const w = plays.map((x) => Math.pow(x + CFOLLOW, GFOLLOW));
    let tot = 0; for (const x of w) tot += x;
    let r = pickVal * tot, i = 0; while (r >= w[i] && i < N - 1) { r -= w[i]; i++; }
    return { chosen: i, followed: true };
  }
  return { chosen: Math.min(N - 1, Math.floor(pickVal * N)), followed: false };
}
function decide(arr, coinVal, pickVal, c) {
  const { chosen } = pickOne(arr, coinVal, pickVal, c);
  arr[chosen] += 1;
  return chosen;
}
const pc = (x) => Math.round(x * 100);

const SONGS = [
  "Neon Static", "Slow Bloom", "Paper Lanterns", "Midnight Radio",
  "Glass House", "Afterglow", "Blue Hour", "Wildfire Heart",
  "Velvet Skyline", "Echo Chamber", "Amber Waves", "Night Drive",
  "Solar Flare", "Quiet Storm", "Faded Polaroid", "Golden Hour",
];

const INDEPENDENT_BLURB = <>Listeners <b>can't</b> see the charts. They select a song without knowing what anyone else has selected.</>;
const SOCIAL_BLURB = <>Listeners <b>can</b> see the charts. They are able to see which songs are most popular before making their selection.</>;

const WORLDS = [
  { key: "independent", label: "Independent world", c: 0, tag: "no charts",
    blurb: INDEPENDENT_BLURB },
  { key: "social-1", label: "Social world 1", c: 1, tag: "with charts",
    blurb: SOCIAL_BLURB },
  { key: "social-2", label: "Social world 2", c: 1, tag: "with charts",
    blurb: SOCIAL_BLURB },
  { key: "social-3", label: "Social world 3", c: 1, tag: "with charts",
    blurb: SOCIAL_BLURB },
  { key: "social-4", label: "Social world 4", c: 1, tag: "with charts",
    blurb: SOCIAL_BLURB },
];

const QUIZ = [
  { key: "app", label: "The Viral App", desc: "A new social media platform surges to 10 million users overnight." },
  { key: "author", label: "The Famous Author", desc: "A well-known author's new book instantly hits the bestseller list." },
  { key: "founder", label: "The Wealthy Founder", desc: "A startup founder raises millions based on a previous successful exit." },
  { key: "all", label: "All of the Above", desc: "Every single one of these scenarios is a runaway feedback loop." },
];

export default function CumulativeAdvantage() {
  const [active, setActive] = useState(null);
  const [plays, setPlays] = useState(new Array(N).fill(0));
  const [phase, setPhase] = useState("building");   // building · done
  const [stepIndex, setStepIndex] = useState(0);
  const [pulse, setPulse] = useState(null);
  const [ffActive, setFfActive] = useState(false);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [lastChosenSong, setLastChosenSong] = useState(null);
  const [completed, setCompleted] = useState([]); // {label, c, hitIndex, hitShare}
  const [revealedQuiz, setRevealedQuiz] = useState(new Set());
  const worldRef = useRef(null);
  const pulseTimer = useRef(null);
  // shared by both press-and-hold and auto-play — same ramp, different trigger/stop
  const player = useRef({ active: false, arr: null, idx: 0, start: 0, lastTick: 0, raf: null, holdTimer: null, lastChosen: null, ffShown: false, mode: null });

  const revealPulse = (chosenId) => {
    setPulse(chosenId);
    clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setPulse(null), 420);
  };

  const recordCompletion = (finalArr, world) => {
    const hitIndex = finalArr.indexOf(Math.max(...finalArr));
    const hitShare = finalArr[hitIndex] / P;
    setCompleted((cw) => [...cw, { label: world.label, c: world.c, hitIndex, hitShare }]);
  };

  const total = plays.reduce((a, b) => a + b, 0) || 1;
  const ranks = useMemo(() => {
    const order = [...plays.keys()].sort((a, b) => plays[b] - plays[a] || a - b);
    const r = new Array(N); order.forEach((sid, rank) => (r[sid] = rank)); return r;
  }, [plays]);
  const leader = ranks.indexOf(0);
  const leaderShare = plays[leader] / total;

  const logit = (p) => Math.log(p / (1 - p));
  const LOGIT_LO = logit(1 / N), LOGIT_HI = logit(0.995);
  const leaderPull = useMemo(() => {
    if (!active || stepIndex === 0) return 0;
    const leaderId = plays.indexOf(Math.max(...plays));
    const weights = plays.map((p) => Math.pow(p + CFOLLOW, GFOLLOW));
    const totalW = weights.reduce((a, b) => a + b, 0);
    const condProb = weights[leaderId] / totalW;
    const prob = active.c * condProb + (1 - active.c) * (1 / N);
    const clamped = Math.min(0.9995, Math.max(0.0005, prob));
    return Math.max(0, Math.min(1, (logit(clamped) - LOGIT_LO) / (LOGIT_HI - LOGIT_LO)));
  }, [plays, active, stepIndex]);

  const choose = (world) => {
    player.current.active = false;
    if (player.current.raf) cancelAnimationFrame(player.current.raf);
    worldRef.current = makeWorld(Date.now() + Math.random() * 1e6);
    setActive(world);
    setPlays(new Array(N).fill(0));
    setStepIndex(0);
    setLastChosenSong(null);
    setPulse(null);
    setFfActive(false);
    setAutoPlaying(false);
    setPhase("building");
  };

  // ── shared ramping player: speed comes only from the tick interval shrinking,
  // never from batching — every single decision still gets its own visible pulse.
  // 'hold' mode is driven by pointer down/up; 'auto' mode is a plain toggle. ──
  const TICK_START_MS = 150, TICK_FLOOR_MS = 30, RAMP_MS = 3000;
  // an ordinary click's down-to-up duration varies (mouse, trackpad, touch) and can easily exceed
  // TICK_START_MS, so the ramp itself is not what gates a second decision — instead, 'hold' mode only
  // arms the ramp once the press has genuinely outlasted a normal click, via this dedicated, cancelable
  // timer. A quick tap always releases before this fires, so it can never produce a second decision.
  const HOLD_CONFIRM_MS = 260;

  const playerTick = (now) => {
    const p = player.current;
    if (!p.active) return;
    const elapsed = now - p.start;
    const interval = TICK_FLOOR_MS + (TICK_START_MS - TICK_FLOOR_MS) * Math.max(0, 1 - elapsed / RAMP_MS);
    if (now - p.lastTick >= interval) {
      p.lastTick = now;
      if (p.mode === "hold" && !p.ffShown) { p.ffShown = true; setFfActive(true); }
      const w = worldRef.current;
      const chosen = decide(p.arr, w.coin[p.idx], w.pick[p.idx], active.c);
      p.lastChosen = chosen;
      p.idx += 1;
      setPlays(p.arr.slice());
      setStepIndex(p.idx);
      setLastChosenSong(chosen);
      setPulse(chosen);
      clearTimeout(pulseTimer.current);
      pulseTimer.current = setTimeout(() => setPulse(null), Math.min(260, interval * 3));
    }
    if (p.idx < P) { p.raf = requestAnimationFrame(playerTick); }
    else {
      p.active = false; setFfActive(false); setAutoPlaying(false);
      revealPulse(p.lastChosen); recordCompletion(p.arr, active); setPhase("done");
    }
  };

  const startPlayer = (mode) => {
    if (!active || !worldRef.current || stepIndex >= P || player.current.active) return;
    const p = player.current;
    p.active = true; p.arr = plays.slice(); p.idx = stepIndex; p.mode = mode;
    p.start = performance.now(); p.lastTick = p.start; p.lastChosen = null; p.ffShown = false;
    if (mode === "auto") setAutoPlaying(true);

    // the very first decision always happens synchronously, so even the fastest tap/click registers
    const w = worldRef.current;
    const chosen = decide(p.arr, w.coin[p.idx], w.pick[p.idx], active.c);
    p.lastChosen = chosen;
    p.idx += 1;
    p.lastTick = performance.now();
    setPlays(p.arr.slice());
    setStepIndex(p.idx);
    setLastChosenSong(chosen);
    revealPulse(chosen);

    if (p.idx >= P) { p.active = false; setAutoPlaying(false); recordCompletion(p.arr, active); setPhase("done"); return; }

    if (mode === "auto") {
      // Auto-Play is a deliberate toggle, not a press — ramp immediately.
      p.raf = requestAnimationFrame(playerTick);
    } else {
      // 'hold' mode: don't arm the ramp until the press has outlasted an ordinary click.
      p.holdTimer = setTimeout(() => {
        if (p.active) p.raf = requestAnimationFrame(playerTick);
      }, HOLD_CONFIRM_MS);
    }
  };

  const stopPlayer = () => {
    const p = player.current;
    if (!p.active) return;
    p.active = false;
    if (p.raf) cancelAnimationFrame(p.raf);
    if (p.holdTimer) clearTimeout(p.holdTimer);
    p.raf = null;
    p.holdTimer = null;
    setFfActive(false);
    setAutoPlaying(false);
    if (p.lastChosen != null) revealPulse(p.lastChosen);
    if (p.idx >= P) { recordCompletion(p.arr, active); setPhase("done"); }
  };

  const startHold = () => startPlayer("hold");
  // stopPlayer stops whatever session is active in the shared player ref, regardless of
  // who started it. The hold button's pointerleave/pointercancel fire on any cursor movement
  // that crosses its bounds — not just while it's actually pressed — so without this guard,
  // moving the mouse away after clicking Auto-Play (which sits right next to this button and
  // becomes disabled) can stop an Auto-Play run this button never touched.
  const stopHold = () => { if (player.current.mode === "hold") stopPlayer(); };
  const startAutoPlay = () => startPlayer("auto");

  useEffect(() => () => {
    if (player.current.raf) cancelAnimationFrame(player.current.raf);
    if (player.current.holdTimer) clearTimeout(player.current.holdTimer);
    clearTimeout(pulseTimer.current);
  }, []);

  const toggleQuiz = (key) => setRevealedQuiz((prev) => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const STAGE_H = N * 24 + 6;

  return (
    <div className="he-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        .he-root{--bg:#F7F8FA;--card:#FFFFFF;--border:#E4E7EC;--ink:#15171C;--muted:#616875;--accent:#4F46E5;
          --stage:#14161B;--cold:#3B4250;--hot:#F59E0B;
          background:var(--bg);color:var(--ink);font-family:'Inter',system-ui,sans-serif;padding:28px 22px 14px;min-height:100%;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
        .he-root *{box-sizing:border-box;}
        .mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums;}
        .he-card.he-first{margin-top:0;}
        .he-lede{font-size:14px;line-height:1.6;color:#3C424C;} .he-lede b{color:var(--ink);font-weight:600;} .he-lede i{color:var(--ink);}
        .he-tryit{background:#F7F7FE;border:1px solid #E3E1FB;border-radius:14px;padding:20px 22px;margin-top:20px;}
        .he-tryit-h{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);font-weight:700;margin-bottom:16px;}
        .he-tryit-steps{display:flex;flex-direction:column;gap:14px;}
        .he-tryit-step{display:flex;gap:12px;align-items:flex-start;}
        .he-tryit-num{flex:0 0 24px;width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;}
        .he-tryit-step div{font-size:14.5px;line-height:1.55;color:#33314A;padding-top:2px;}
        .he-tryit-step b{color:var(--ink);}
        .he-tryit-note{margin-top:16px;padding-top:14px;border-top:1px solid #E3E1FB;font-size:13.5px;line-height:1.55;color:#4A4768;}
        .he-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;margin-top:18px;box-shadow:0 1px 2px rgba(20,22,28,.04);}
        .he-presets{display:flex;gap:8px;flex-wrap:wrap;}
        .he-pbtn{background:var(--card);border:1px solid var(--border);border-radius:999px;padding:7px 15px;cursor:pointer;font-size:13px;font-weight:600;color:var(--muted);transition:border-color .15s,background .15s,color .15s;}
        .he-pbtn:hover{border-color:var(--accent);color:var(--ink);}
        .he-pbtn:focus-visible{outline:2px solid var(--accent);outline-offset:2px;}
        .he-pbtn.on{border-color:var(--accent);background:var(--accent);color:#fff;}
        .he-explain{margin-top:16px;background:#F0F1FE;border:1px solid #DFE0FB;border-radius:10px;padding:14px 15px;font-size:14px;line-height:1.6;color:#2E2C55;}
        .he-explain b{color:var(--ink);}
        .he-stage{background:var(--stage);border-radius:12px;padding:16px 16px 12px;margin-top:16px;}
        .he-stagehd{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px;flex-wrap:wrap;gap:8px;}
        .he-stagehd .t{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#8A909C;font-weight:600;}
        .he-readout{display:flex;gap:14px;font-size:11px;color:#B8BEC8;flex-wrap:wrap;} .he-readout b{color:var(--hot);font-weight:700;}
        .he-rows{position:relative;}
        .he-song{position:absolute;left:0;right:0;height:24px;display:flex;align-items:center;gap:8px;transition:transform .7s cubic-bezier(.3,.8,.3,1);}
        .he-sid{width:98px;flex:0 0 98px;font-size:10px;color:#9AA0AC;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .he-track{flex:1;height:12px;position:relative;background:rgba(255,255,255,.04);border-radius:3px;}
        .he-bar{position:absolute;left:0;top:1px;height:10px;border-radius:3px;background:var(--cold);transition:width .8s cubic-bezier(.22,.7,.25,1),background .4s ease,box-shadow .18s ease;}
        .he-bar-overlay{position:absolute;left:0;top:1px;height:10px;border-radius:3px;background:var(--hot);pointer-events:none;transition:width .8s cubic-bezier(.22,.7,.25,1),opacity .4s ease;}
        .he-bar.hot{background:var(--hot);}
        .he-pv{width:34px;flex:0 0 34px;font-size:10.5px;color:#9AA0AC;} .he-pv.hot{color:var(--hot);font-weight:700;}
        .he-result{margin-top:12px;min-height:18px;}
        .he-resultpills{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
        .he-resultcaption{margin-top:8px;font-size:12.5px;color:#AEB4BF;line-height:1.5;}
        .he-pill{display:inline-flex;align-items:center;gap:6px;border-radius:20px;font-weight:600;}
        .he-pill .pct{font-family:'JetBrains Mono',monospace;font-variant-numeric:tabular-nums;}
        .he-pill-stage{padding:6px 13px;font-size:13px;}
        .he-pill-stage.he-pill-hit{background:rgba(245,158,11,.18);color:var(--hot);border:1px solid rgba(245,158,11,.4);}
        .he-pill-stage.he-pill-flat{background:rgba(255,255,255,.08);color:#B8BEC8;border:1px solid rgba(255,255,255,.14);}
        .he-pill-tracker{padding:3px 10px;font-size:11.5px;}
        .he-pill-tracker.he-pill-hit{background:#FDF3E1;color:#B45309;border:1px solid #F3D9A8;}
        .he-pill-tracker.he-pill-flat{background:#F1F2F4;color:var(--muted);border:1px solid var(--border);}
        .he-hint{font-size:12px;color:var(--muted);}
        .he-pick-note{font-size:13px;color:var(--ink);margin-top:10px;}
        .he-pick-note b{font-weight:600;color:var(--accent);}
        .he-btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;align-items:center;}
        .he-btn{appearance:none;border-radius:9px;padding:11px 17px;font-family:inherit;font-weight:600;font-size:13.5px;cursor:pointer;border:1px solid var(--border);background:var(--card);color:var(--ink);transition:border-color .15s,transform .08s;}
        .he-btn:hover{border-color:var(--ink);} .he-btn:active{transform:translateY(1px);}
        .he-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px;}
        .he-btn.solid{background:var(--accent);color:#fff;border-color:var(--accent);} .he-btn.solid:hover{filter:brightness(1.07);}
        .he-btn:disabled{opacity:.45;cursor:not-allowed;}
        .he-peek{margin-top:14px;background:#FBFAF7;border:1px solid var(--border);border-radius:10px;padding:14px 15px;font-size:13.5px;line-height:1.6;}
        .he-peek b{color:var(--ink);}
        .he-runresult{margin-top:14px;background:#FBFAF7;border:1px solid var(--border);border-radius:10px;padding:14px 15px;}
        .he-runresult .he-eyebrow{margin-bottom:6px;}
        .he-runresult p{font-size:13.5px;line-height:1.6;color:#3C424C;}
        .he-runresult b{color:var(--ink);}
        .he-tracker{margin-top:18px;}
        .he-tracker-h{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:600;margin-bottom:8px;}
        .he-tracker-row{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:13px;padding:7px 0;border-top:1px solid var(--border);color:#3C424C;}
        .he-tracker-row b{color:var(--ink);}
        .he-insight{margin-top:0;font-size:14px;line-height:1.65;color:#3C424C;}
        .he-insight p{margin:0 0 12px;} .he-insight p:last-child{margin-bottom:0;}
        .he-insight b{color:var(--ink);}
        .he-eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);font-weight:700;margin-bottom:9px;}
        .he-concept{display:flex;gap:13px;align-items:flex-start;margin:16px 0;padding:15px 17px;background:#F7F7FE;border:1px solid #E3E1FB;border-radius:12px;}
        .he-concept-body{font-size:14px;line-height:1.6;color:#33314A;}
        .he-concept-term{font-weight:700;color:var(--accent);}
        .he-quizhd{font-size:19px;font-weight:700;letter-spacing:-.01em;margin:0 0 8px;}
        .he-quizprompt{font-size:14px;color:#3C424C;margin:0 0 16px;line-height:1.5;}
        .he-quizitem{margin-bottom:10px;}
        .he-quizopt{display:block;width:100%;text-align:left;background:var(--card);border:1.5px solid var(--border);border-radius:10px;padding:13px 15px;cursor:pointer;transition:border-color .15s,background .15s;}
        .he-quizopt:hover{border-color:var(--accent);}
        .he-quizopt.open{border-color:var(--accent);background:#F0F1FE;border-bottom-left-radius:0;border-bottom-right-radius:0;}
        .he-quizlab{font-size:14px;font-weight:600;color:var(--ink);display:block;}
        .he-quizdesc{font-size:13px;color:var(--muted);margin-top:3px;display:block;}
        .he-quizreveal{background:#FBFAF7;border:1.5px solid var(--accent);border-top:none;border-radius:0 0 10px 10px;padding:14px 15px;font-size:13.5px;line-height:1.6;color:#3C424C;margin-top:-1px;}
        .he-quizreveal b{color:var(--ink);}
        .he-quizreveal ul{margin:8px 0;padding-left:20px;} .he-quizreveal li{margin-bottom:6px;}
        .he-footer{margin-top:24px;padding:15px 2px 6px;border-top:1px solid var(--border);font-size:12px;color:var(--muted);line-height:1.6;display:flex;gap:10px;align-items:flex-start;} .he-footer b{color:var(--ink);}
        .he-footer-icon{flex:0 0 auto;margin-top:2px;color:var(--muted);}
        @media(max-width:620px){.he-sid{width:76px;flex:0 0 76px;}}
        /* he-root's padding goes to zero on every side, not just
           horizontally — the asset-mount wrapper around this component clips
           to a 16px rounded corner, so any leftover top/bottom padding here
           left a tinted, separately-rounded strip poking out above he-first
           (whose own margin-top is already 0). At 0 padding, he-first's own
           rounded top sits flush with asset-mount's, so there's a single
           corner instead of two stacked ones — and the tint still reads as
           a page tone in the gaps between the cards below it. */
        @media(max-width:600px){
          .he-root{padding:0;}
          .he-card{padding:14px;}
          .he-stage{padding:12px 10px 10px;}
        }
        /* The bar track is the whole point of the visualisation, but its
           width is whatever's left after the song-label and play-count
           columns — on the narrowest phones that left as little as ~75px
           for the actual bars, barely enough to compare two songs by eye.
           Narrowing both side columns further reclaims most of that back. */
        @media(max-width:480px){
          .he-sid{width:64px;flex:0 0 64px;font-size:9.5px;}
          .he-pv{width:26px;flex:0 0 26px;font-size:10px;}
        }
        @media(prefers-reduced-motion:reduce){*{transition:none!important;}}
      `}</style>

      <div className="he-card he-first">
        <div className="he-quizhd">Cumulative Advantage Explorable</div>

        <p className="he-lede">
          In 2006, researchers Salganik, Dodds, and Watts ran an experiment to understand why some songs become
          massive hits while others fail. They wanted to test if "hit" songs are truly the best, or if something
          else is at play. To test this, they created an online market named <i>Music Lab</i>, where participants
          downloaded songs by unknown bands. One group made choices independently, based purely on personal taste,
          while others were shown dynamic charts detailing the download popularity of each song before making their
          selections. This explorable simulates the outcome of that experiment, and demonstrates how an initial
          advantage (a lead in the charts) can produce a snowball effect, causing a moderately good song to
          monopolise the market simply because it gained an accidental head start.
        </p>

        <div className="he-tryit">
          <div className="he-tryit-h">Try it yourself</div>
          <div className="he-tryit-steps">
            <div className="he-tryit-step">
              <span className="he-tryit-num">1</span>
              <div><b>Select a world.</b> Choose either the Independent world (no charts) or one of the Social worlds (with charts).</div>
            </div>
            <div className="he-tryit-step">
              <span className="he-tryit-num">2</span>
              <div><b>Simulate decisions.</b> Click Next Selection to step through individual choices, hold the
                button down to fast-forward, or hit Auto-Play to run through the full set of participant decisions
                automatically.</div>
            </div>
          </div>
          <div className="he-tryit-note">
            As each song selection is made, watch how early random choices start to shape the chart and how that
            influences the choices of other participants.
          </div>
        </div>
      </div>

      <div className="he-card">
        <div className="he-presets" role="group" aria-label="Choose a world">
          {WORLDS.map((w) => (
            <button
              key={w.key}
              className={`he-pbtn ${active?.key === w.key ? "on" : ""}`}
              aria-pressed={active?.key === w.key}
              onClick={() => choose(w)}
            >
              {w.label}
            </button>
          ))}
        </div>

        {active && (
          <div className="he-explain">
            <b>{active.label}.</b> {active.blurb}
          </div>
        )}

        <div className="he-stage">
          <div className="he-stagehd">
            <span className="t">
              {!active ? "Choose a world above"
                : phase === "done" ? `Chart complete: ${active.label}`
                : `Building the chart, listener ${stepIndex} of ${P}`}
            </span>
            {stepIndex > 0 && (
              <div className="he-readout">
                <span>Top track <b>{SONGS[leader]}</b></span>
              </div>
            )}
          </div>
          <div className="he-rows" style={{ height: STAGE_H }}>
            {Array.from({ length: N }, (_, sid) => {
              const slot = ranks[sid];
              const isHot = phase === "done" && slot === 0 && active?.c > 0;
              const isLeaderNow = phase === "building" && slot === 0 && stepIndex > 0;
              const isPulsing = sid === pulse;
              const widthPct = `${(plays[sid] / P) * 100}%`;
              const eased = Math.sqrt(leaderPull);

              const shadows = [];
              if (isPulsing) shadows.push("0 0 0 2px rgba(255,255,255,.75)");
              if (isHot) shadows.push("0 0 12px rgba(245,158,11,.55)");
              else if (isLeaderNow) shadows.push(`0 0 ${(2 + 14 * eased).toFixed(0)}px rgba(245,158,11,${(0.1 + 0.45 * eased).toFixed(2)})`);
              const barStyle = { width: widthPct };
              if (shadows.length) barStyle.boxShadow = shadows.join(", ");

              return (
                <div key={sid} className="he-song" style={{ transform: `translateY(${slot * 24}px)` }}>
                  <span className="he-sid">{SONGS[sid]}</span>
                  <span className="he-track">
                    <span className={`he-bar ${isHot ? "hot" : ""}`} style={barStyle} />
                    {isLeaderNow && <span className="he-bar-overlay" style={{ width: widthPct, opacity: eased.toFixed(2) }} />}
                  </span>
                  <span className={`he-pv mono ${isHot ? "hot" : ""}`}>{plays[sid]}</span>
                </div>
              );
            })}
          </div>
          <div className="he-result">
            {phase === "done" && active && (
              active.c === 0 ? (
                <>
                  <div className="he-resultpills">
                    <span className="he-pill he-pill-stage he-pill-flat">{SONGS[leader]} <span className="pct">{pc(leaderShare)}%</span></span>
                    <span className="he-pill he-pill-stage he-pill-flat">no clear leader</span>
                  </div>
                  <div className="he-resultcaption">Close to the even split you'd expect across sixteen tracks.</div>
                </>
              ) : (
                <div className="he-resultpills">
                  <span className="he-pill he-pill-stage he-pill-hit">{SONGS[leader]} <span className="pct">{pc(leaderShare)}%</span></span>
                </div>
              )
            )}
          </div>
        </div>

        {phase === "done" && active && (
          <div className="he-runresult">
            <div className="he-eyebrow">What happened</div>
            {active.c === 0 ? (
              <p>
                <b>{SONGS[leader]}</b> narrowly finished on top with {pc(leaderShare)}% of plays, but since nobody
                could see anyone else's choices, no early lead had a chance to snowball. Any of the sixteen tracks
                was just as likely to end up here.
              </p>
            ) : (
              <p>
                <b>{SONGS[leader]}</b> won with {pc(leaderShare)}% of all plays. It didn't start out as the best
                song; it just picked up a few extra plays early on. As its count grew, later listeners saw it near
                the top of the chart, assumed it must be good, and picked it too, widening its lead until it
                snowballed into a runaway hit.
              </p>
            )}
          </div>
        )}

        {active && phase === "building" && (
          <div className="he-btns">
            <button
              className="he-btn solid"
              disabled={autoPlaying}
              onPointerDown={startHold}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              onKeyDown={(e) => {
                if (e.key === " ") e.preventDefault();
                if ((e.key === "Enter" || e.key === " ") && !e.repeat) startHold();
              }}
              onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") stopHold(); }}
            >
              {ffActive ? `Fast-forwarding, listener ${stepIndex} of ${P}` : `Next Selection → (listener ${stepIndex + 1} of ${P})`}
            </button>
            <button
              className="he-btn"
              disabled={ffActive}
              onClick={autoPlaying ? stopPlayer : startAutoPlay}
            >
              {autoPlaying ? `Stop, listener ${stepIndex} of ${P}` : "Auto-Play"}
            </button>
          </div>
        )}
        {active && phase === "building" && stepIndex > 0 && lastChosenSong != null && (
          <div className="he-pick-note">
            Listener {stepIndex} selected <b>{SONGS[lastChosenSong]}</b>.
          </div>
        )}
        {active && phase === "building" && (
          <div className="he-hint" style={{ marginTop: 8 }}>
            Press and hold the button to fast forward or use Auto-Play to run the simulation automatically.
          </div>
        )}

        {!active && (
          <div className="he-peek">Choose a world above, then build its chart yourself, one listener at a time.</div>
        )}

        {completed.length > 0 && (
          <div className="he-tracker">
            <div className="he-tracker-h">Outcomes so far (share of plays)</div>
            {completed.map((w, i) => (
              <div key={i} className="he-tracker-row">
                <span>{w.label}</span>
                {w.c === 0
                  ? <span className="he-pill he-pill-tracker he-pill-flat">no clear leader</span>
                  : <span className="he-pill he-pill-tracker he-pill-hit">{SONGS[w.hitIndex]} <span className="pct">{pc(w.hitShare)}%</span></span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {completed.length > 0 && (
        <div className="he-card">
          <div className="he-insight">
            <div className="he-eyebrow">The takeaway</div>
            <p>
              If you ran the simulation across several social worlds, you likely noticed that the same song can
              become a runaway #1 hit in one world and completely flop in another:{" "}
              <b>Its success depended entirely on who got lucky first.</b>
            </p>
            <p>
              In the Independent world, a song's success matches its quality, because people only rely on their
              own taste. But the moment you introduce a chart, you introduce social influence. An accidental,
              tiny head start makes a song more visible; future participants see that popularity, assume the song
              must be good, and download it too. That small advantage compounds over and over, until a completely
              average song snowballs into an unstoppable market monopoly.
            </p>
            <div className="he-concept">
              <div className="he-concept-body">
                <span className="he-concept-term">Cumulative Advantage</span>, often called the{" "}
                <span className="he-concept-term">Matthew Effect</span>, is a simple rule: the rich get richer,
                and the popular get more popular.
              </div>
            </div>
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="he-card">
          <div className="he-eyebrow">Beyond the lab</div>
          <div className="he-quizhd">Cumulative advantage in the real world</div>
          <p className="he-quizprompt">Which of these real-world scenarios do you think is driven by cumulative advantage? Click one to reveal the hidden mechanics.</p>

          {QUIZ.map((q) => (
            <div key={q.key} className="he-quizitem">
              <button className={`he-quizopt ${revealedQuiz.has(q.key) ? "open" : ""}`} onClick={() => toggleQuiz(q.key)}>
                <span className="he-quizlab">{q.label}</span>
                <span className="he-quizdesc">{q.desc}</span>
              </button>
              {revealedQuiz.has(q.key) && (
                <div className="he-quizreveal">
                  {q.key === "app" && (
                    <p><b>Correct, but there is more!</b> A new app doesn't just grow because it is useful; it
                    grows because everyone else is on it. In tech, this is called the "network effect", a
                    classic form of cumulative advantage where early user growth makes the platform exponentially
                    more valuable to the next person, locking out competitors.</p>
                  )}
                  {q.key === "author" && (
                    <p><b>Correct, but there is more!</b> Bookstores and algorithms heavily feature titles
                    already on "Bestseller Lists." Because a book is prominently displayed as a hit, casual
                    shoppers buy it simply based on that social proof, compounding its sales and keeping it at
                    the top of the charts.</p>
                  )}
                  {q.key === "founder" && (
                    <p><b>Correct, but there is more!</b> This is the literal definition of the Matthew Effect
                    ("the rich get richer"). An initial financial success gives a founder reputation and capital.
                    Venture capitalists crowd to fund them again, while equally brilliant, first-time founders
                    struggle to get a foot in the door.</p>
                  )}
                  {q.key === "all" && (
                    <>
                      <p><b>You nailed it.</b> Cumulative advantage is everywhere.</p>
                      <ul>
                        <li><b>Social Media:</b> algorithms push already-popular posts to the top of your feed, making them even more popular.</li>
                        <li><b>Publishing:</b> bestseller lists make people buy books they otherwise wouldn't have looked at.</li>
                        <li><b>Finance:</b> early capital allows founders to take bigger risks, attracting even more capital.</li>
                      </ul>
                      <p>By understanding this loop, you see the world differently. You realize that success
                      isn't always a pure meritocracy. Often, it is just a tiny spark of luck that snowballed
                      out of control.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="he-footer">
        <svg className="he-footer-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3.6C8 3.6 6.6 2.6 3.7 2.6C2.9 2.6 2.3 3.2 2.3 4V11.8C2.3 11.8 3.7 11.4 5.6 11.4C7 11.4 8 12.4 8 12.4M8 3.6V12.4M8 3.6C8 3.6 9.4 2.6 12.3 2.6C13.1 2.6 13.7 3.2 13.7 4V11.8C13.7 11.8 12.3 11.4 10.4 11.4C9 11.4 8 12.4 8 12.4"
            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div>
          Based on Salganik, Dodds &amp; Watts, "Experimental Study of Inequality and Unpredictability in an
          Artificial Cultural Market" (<i>Science</i>, 2006).
        </div>
      </div>
    </div>
  );
}
