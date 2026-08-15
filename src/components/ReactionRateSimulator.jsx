import { useEffect, useRef, useState } from "react";

// Ported from a standalone React prototype (inline-styled, dark canvas
// simulation) into this site's established component pattern: one scoped
// <style> block using the site's design tokens instead of inline styles,
// following NaturalSelection.jsx / SoloRubric.jsx / AlignmentMap.jsx.
//
// Styling changes made on the way in:
//  - "Try this" callout: dropped the left-border-rule treatment (same
//    left-line style removed from the Natural Selection callout earlier)
//    in favour of an inset blue-tinted card, matching the site's established
//    callout language.
//  - Info tooltip: was hover-only via onMouseEnter/onMouseLeave with no
//    keyboard access at all. Rebuilt as a real focusable button with a
//    CSS :hover/:focus-within tooltip, matching the accessible tooltip
//    pattern built for AlignmentMap.
//  - Reset button gained a proper :hover state (had none).
//  - Range sliders' labels are now programmatically associated via
//    htmlFor/id (weren't before).
//  - Controls collapse to one column on narrow containers.
// Behaviour change requested: the quiz used to render open by default; it's
// now gated behind a reveal button, matching the reveal pattern already used
// throughout the other two assets.
//
// Simulation physics/logic are untouched.

const COLORS = { A: "#4FC3F7", B: "#FF9E5E", C: "#5EE3A6" };
const WIDTH = 720;
const HEIGHT = 380;
const INITIAL_TEMPERATURE = 10;
const INITIAL_ACTIVATION_ENERGY = 95;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function speedForTemp(temp) {
  return 0.4 + (temp / 100) * 2.6;
}

function makeParticle(type, temp) {
  const speedFactor = rand(0.6, 1.4);
  const speed = speedForTemp(temp) * speedFactor;
  const angle = rand(0, Math.PI * 2);
  return {
    type,
    x: rand(20, WIDTH - 20),
    y: rand(20, HEIGHT - 20),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: 7,
    flash: 0,
    speedFactor,
  };
}

function initParticles(temp) {
  const particles = [];
  for (let i = 0; i < 16; i++) particles.push(makeParticle("A", temp));
  for (let i = 0; i < 16; i++) particles.push(makeParticle("B", temp));
  return particles;
}

const ChevronDown = () => (
  <svg className="rxn-chev" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ReactionRateSimulator() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const productCountRef = useRef(0);
  const reactionLogRef = useRef([]);
  const reactionEventsRef = useRef([]);
  const rafRef = useRef(null);

  const [temperature, setTemperature] = useState(INITIAL_TEMPERATURE);
  const [activationEnergy, setActivationEnergy] = useState(INITIAL_ACTIVATION_ENERGY);
  const [showQuestions, setShowQuestions] = useState(false);

  // Latest slider values, readable from inside the animation loop without
  // needing to restart the loop or re-bind the effect on every change.
  const tempRef = useRef(temperature);
  const actRef = useRef(activationEnergy);
  useEffect(() => { tempRef.current = temperature; }, [temperature]);
  useEffect(() => { actRef.current = activationEnergy; }, [activationEnergy]);

  const [stats, setStats] = useState({ product: 0, rate: 0, remaining: 32 });

  function resetExperiment() {
    tempRef.current = INITIAL_TEMPERATURE;
    actRef.current = INITIAL_ACTIVATION_ENERGY;
    setTemperature(INITIAL_TEMPERATURE);
    setActivationEnergy(INITIAL_ACTIVATION_ENERGY);
    particlesRef.current = initParticles(INITIAL_TEMPERATURE);
    productCountRef.current = 0;
    reactionLogRef.current = [];
    reactionEventsRef.current = [];
    setStats({ product: 0, rate: 0, remaining: 32 });
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    particlesRef.current = initParticles(tempRef.current);

    function colorFor(type) {
      return COLORS[type];
    }

    function step() {
      const particles = particlesRef.current;

      particles.forEach((p) => {
        const targetSpeed = speedForTemp(tempRef.current) * p.speedFactor;
        const currentSpeed = Math.hypot(p.vx, p.vy) || 0.01;
        const scale = 1 + (targetSpeed / currentSpeed - 1) * 0.02;
        p.vx *= scale;
        p.vy *= scale;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < p.r || p.x > WIDTH - p.r) p.vx *= -1;
        if (p.y < p.r || p.y > HEIGHT - p.r) p.vy *= -1;
        p.x = Math.max(p.r, Math.min(WIDTH - p.r, p.x));
        p.y = Math.max(p.r, Math.min(HEIGHT - p.r, p.y));

        if (p.flash > 0) p.flash -= 0.025;
      });

      const actThreshold = (actRef.current / 100) * 5.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          if (p1.type === "C" || p2.type === "C") continue;
          if (p1.type === p2.type) continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);
          if (dist < p1.r + p2.r) {
            const relSpeed = Math.hypot(p1.vx - p2.vx, p1.vy - p2.vy);
            if (relSpeed > actThreshold) {
              p1.type = "C";
              p2.type = "C";
              p1.flash = 1;
              p2.flash = 1;
              productCountRef.current += 2;
              reactionLogRef.current.push(Date.now());
              reactionEventsRef.current.push({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, age: 0 });
            } else {
              const nx = dx / (dist || 1);
              const ny = dy / (dist || 1);
              const tvx = p1.vx;
              const tvy = p1.vy;
              p1.vx = p2.vx;
              p1.vy = p2.vy;
              p2.vx = tvx;
              p2.vy = tvy;
              p1.x += nx * 0.6;
              p1.y += ny * 0.6;
              p2.x -= nx * 0.6;
              p2.y -= ny * 0.6;
            }
          }
        }
      }

      const now = Date.now();
      reactionLogRef.current = reactionLogRef.current.filter((t) => now - t < 5000);
      const rate = (reactionLogRef.current.length / 5).toFixed(1);
      const remaining = particles.filter((p) => p.type !== "C").length;

      reactionEventsRef.current.forEach((e) => { e.age += 1; });
      reactionEventsRef.current = reactionEventsRef.current.filter((e) => e.age < 40);

      setStats({ product: productCountRef.current, rate, remaining });
    }

    function draw() {
      ctx.fillStyle = "rgba(18,20,28,0.28)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      reactionEventsRef.current.forEach((e) => {
        const t = e.age / 40;
        const radius = 8 + t * 38;
        ctx.beginPath();
        ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(94,227,166,${(1 - t) * 0.9})`;
        ctx.lineWidth = 3 * (1 - t) + 0.5;
        ctx.stroke();
      });

      particlesRef.current.forEach((p) => {
        const glow = p.flash > 0;
        if (glow) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + p.flash * 16, 0, Math.PI * 2);
          ctx.globalAlpha = 0.55 * p.flash;
          ctx.fillStyle = colorFor(p.type);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (glow ? 1 + p.flash * 0.5 : 1), 0, Math.PI * 2);
        ctx.fillStyle = colorFor(p.type);
        ctx.shadowColor = colorFor(p.type);
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    ctx.fillStyle = "#12141C";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    function loop() {
      step();
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // Intentionally empty — the loop reads live values via refs, so it should
    // start once on mount, not restart every time a slider changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="reaction-sim">
      <style>{`
        .reaction-sim{background:var(--bg);border:1px solid var(--line);border-radius:16px;padding:36px 34px;
          font-family:'Inter',sans-serif;color:var(--text);font-size:16px;line-height:1.6;
          container-type:inline-size;}
        .reaction-sim *{box-sizing:border-box;}

        .rxn-h2{font-family:'Poppins',sans-serif;font-weight:600;font-size:20px;margin:0 0 12px;color:var(--text);}
        .rxn-intro{font-size:14.5px;color:var(--text-soft);line-height:1.6;margin:0 0 24px;}

        .rxn-canvas-wrap{background:#12141C;border-radius:16px;overflow:hidden;margin-bottom:20px;}
        .rxn-canvas-wrap canvas{display:block;width:100%;height:auto;}
        .rxn-legend{display:flex;gap:16px;padding:12px 16px;font-size:12.5px;color:#C9CCD6;
          background:#191C26;border-top:1px solid #262A38;flex-wrap:wrap;}
        .rxn-legend-item{display:inline-flex;align-items:center;gap:6px;}
        .rxn-legend-dot{width:9px;height:9px;border-radius:50%;display:inline-block;}

        .rxn-callout{background:var(--blue-bg);border-radius:12px;padding:18px 20px;margin-bottom:24px;}
        .rxn-callout-lede{margin:0 0 15px;font-size:14px;color:var(--text-soft);line-height:1.65;}
        .rxn-callout b{color:var(--text);}
        .rxn-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:11px;}
        .rxn-steps li{display:flex;gap:12px;align-items:flex-start;}
        .rxn-num{flex:0 0 22px;width:22px;height:22px;border-radius:50%;background:var(--blue);color:#fff;
          font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;}
        .rxn-steps li > span:last-child{font-size:14px;line-height:1.55;color:var(--text-soft);padding-top:2px;}

        .rxn-controls{display:grid;grid-template-columns:1fr 1fr;gap:16px 24px;margin-bottom:18px;}
        .rxn-control-label{display:flex;justify-content:space-between;align-items:center;
          font-size:13px;font-weight:600;margin-bottom:6px;}
        .rxn-control-label-text{display:inline-flex;align-items:center;}
        .rxn-control-value{color:var(--blue);}
        .rxn-slider{width:100%;accent-color:var(--blue);}

        .rxn-tip{position:relative;display:inline-flex;margin-left:5px;}
        .rxn-info-btn{display:inline-flex;align-items:center;justify-content:center;
          width:15px;height:15px;border-radius:50%;background:var(--bg-soft);color:var(--text-soft);
          font-size:10px;font-weight:700;cursor:help;border:1px solid var(--line);padding:0;
          font-family:'Inter',sans-serif;}
        .rxn-info-btn:focus-visible{outline:2px solid var(--blue);outline-offset:2px;}
        .rxn-tip-bubble{position:absolute;bottom:calc(100% + 9px);left:50%;
          transform:translateX(-50%) translateY(4px);width:220px;background:var(--text);color:#fff;
          font-family:'Inter',sans-serif;font-size:12px;font-weight:400;line-height:1.55;
          padding:10px 12px;border-radius:10px;text-align:left;
          box-shadow:0 8px 20px rgba(0,0,0,.18);pointer-events:none;z-index:6;
          opacity:0;visibility:hidden;transition:opacity .16s ease,transform .16s ease;}
        .rxn-tip-bubble::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);
          border:5px solid transparent;border-top-color:var(--text);}
        .rxn-tip:hover .rxn-tip-bubble,.rxn-tip:focus-within .rxn-tip-bubble{
          opacity:1;visibility:visible;transform:translateX(-50%) translateY(0);}

        .rxn-stats{display:flex;gap:12px;margin-bottom:18px;flex-wrap:wrap;}
        .rxn-stat{flex:1;min-width:140px;background:var(--bg-soft);border-radius:var(--radius);padding:12px 16px;}
        .rxn-stat-num{font-family:'Poppins',sans-serif;font-size:22px;font-weight:600;}
        .rxn-stat-label{font-size:12px;color:var(--text-soft);margin-top:2px;}

        .rxn-reset{font-size:14px;font-weight:600;padding:11px 20px;border-radius:999px;border:none;
          cursor:pointer;background:var(--text);color:#fff;font-family:'Inter',sans-serif;
          transition:background .12s ease;}
        .rxn-reset:hover{background:#3a3a3a;}
        .rxn-reset:focus-visible{outline:2px solid var(--blue);outline-offset:2px;}

        .rxn-quiz-section{margin-top:36px;padding-top:28px;border-top:1px solid var(--line);}
        .rxn-quiz-label{font-size:12px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;
          color:var(--text-soft);margin:0 0 18px;}
        .rxn-reveal{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;
          background:#fff;border:1px dashed var(--line);border-radius:var(--radius);padding:13px 16px;
          font-family:'Inter',sans-serif;font-size:14px;font-weight:600;color:var(--blue);cursor:pointer;
          transition:background .14s ease,border-color .14s ease;}
        .rxn-reveal:hover{background:var(--blue-bg);border-color:var(--blue);}
        .rxn-reveal:focus-visible{outline:2px solid var(--blue);outline-offset:2px;}
        .rxn-reveal .rxn-chev{transition:transform .16s ease;}
        .rxn-reveal:hover .rxn-chev{transform:translateY(2px);}

        .rxn-quiz-q{background:var(--bg-soft);border:1px solid var(--line);border-radius:16px;
          padding:20px 22px;margin-bottom:14px;}
        .rxn-quiz-q:last-child{margin-bottom:0;}
        .rxn-quiz-head{display:flex;gap:12px;align-items:flex-start;margin-bottom:16px;}
        .rxn-quiz-num{flex:0 0 26px;width:26px;height:26px;border-radius:50%;background:var(--blue);
          color:#fff;font-family:'Poppins',sans-serif;font-size:12px;font-weight:700;
          display:flex;align-items:center;justify-content:center;margin-top:1px;}
        .rxn-quiz-prompt{font-size:14.5px;font-weight:600;margin:0;line-height:1.5;}

        .rxn-quiz-opt{display:flex;align-items:center;gap:12px;width:100%;text-align:left;
          background:#fff;border:1px solid var(--line);border-radius:12px;padding:11px 14px;
          margin-bottom:8px;cursor:pointer;font-size:13.5px;font-family:'Inter',sans-serif;
          color:var(--text);transition:background .12s ease,border-color .12s ease,transform .1s ease;}
        .rxn-quiz-opt:last-of-type{margin-bottom:0;}
        .rxn-quiz-opt:hover{border-color:var(--blue);transform:translateX(2px);}
        .rxn-quiz-opt:focus-visible{outline:2px solid var(--blue);outline-offset:2px;}
        .rxn-quiz-opt-marker{flex:0 0 22px;width:22px;height:22px;border-radius:50%;
          background:var(--bg-soft);border:1.5px solid var(--line);color:var(--text-soft);
          font-family:'Poppins',sans-serif;font-size:11px;font-weight:700;
          display:flex;align-items:center;justify-content:center;transition:all .12s ease;}
        .rxn-quiz-opt-text{flex:1;}
        .rxn-quiz-opt.selected{transform:none;}
        .rxn-quiz-opt.selected.correct{background:#E8F5EC;border-color:#4CAF6D;}
        .rxn-quiz-opt.selected.correct .rxn-quiz-opt-marker{background:#4CAF6D;border-color:#4CAF6D;color:#fff;}
        .rxn-quiz-opt.selected.incorrect{background:#FBEAEA;border-color:#D9534F;}
        .rxn-quiz-opt.selected.incorrect .rxn-quiz-opt-marker{background:#D9534F;border-color:#D9534F;color:#fff;}

        .rxn-quiz-feedback{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.55;
          margin-top:12px;padding:12px 14px;border-radius:12px;}
        .rxn-quiz-feedback-icon{flex:0 0 20px;width:20px;height:20px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;margin-top:1px;}
        .rxn-quiz-feedback.correct{color:#2C7A47;background:#E8F5EC;}
        .rxn-quiz-feedback.correct .rxn-quiz-feedback-icon{background:#4CAF6D;}
        .rxn-quiz-feedback.incorrect{color:#A83B36;background:#FBEAEA;}
        .rxn-quiz-feedback.incorrect .rxn-quiz-feedback-icon{background:#D9534F;}

        @container (max-width:480px){
          .rxn-controls{grid-template-columns:1fr;}
        }
        /* A container can't query its own size — only its descendants can
           query it — so the padding reduction below uses a viewport media
           query instead of @container. The border and radius are dropped
           here too — on a phone screen there's no surrounding page chrome
           this card needs to visually separate from, so it's just a second
           frame squeezed inside the piece page's own margin, taking width
           away from the simulation itself. Horizontal padding goes to
           near-zero rather than just shrinking — the canvas and controls
           below already carry their own background/border, so they read
           fine sitting flush against the page's own margin. */
        @media (max-width:600px){
          .reaction-sim{padding:16px 2px;border:none;border-radius:0;}
        }
      `}</style>

      <h2 className="rxn-h2">Reaction rate simulator</h2>
      <p className="rxn-intro">
        This simulation explores collision theory, which is the set of ideas chemists use to explain
        why reactions happen at the rate they do. Observe the particles as they move around the
        simulated environment, then use the controls below to manipulate the environment and see how
        the particles react.
      </p>

      <div className="rxn-canvas-wrap">
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
        <div className="rxn-legend">
          <Legend color={COLORS.A} label="Reactant A" />
          <Legend color={COLORS.B} label="Reactant B" />
          <Legend color={COLORS.C} label="Product C" />
        </div>
      </div>

      <div className="rxn-callout">
        <p className="rxn-callout-lede">
          The environment starts with a low temperature and high energy barrier. Notice that in this
          environment, no reactions are occuring between the particles. Now, do the following:
        </p>
        <ol className="rxn-steps">
          <li><span className="rxn-num">1</span><span>Lower the Activation Energy slider and see what changes.</span></li>
          <li><span className="rxn-num">2</span><span>Reset the experiment and raise only the Temperature slider.</span></li>
          <li><span className="rxn-num">3</span><span>Compare what is different about each change before answering the questions below.</span></li>
        </ol>
      </div>

      <div className="rxn-controls">
        <Control
          id="rxn-temp"
          label="Temperature"
          info="How fast the particles are moving, on average. One of the variables chemists study when investigating reaction rate."
          value={temperature}
          min={10}
          max={100}
          onChange={setTemperature}
        />
        <Control
          id="rxn-act"
          label="Activation energy"
          info="The minimum energy two particles need at the moment of collision for a reaction to take place. One of the variables chemists study when investigating reaction rate."
          value={activationEnergy}
          min={10}
          max={95}
          onChange={setActivationEnergy}
        />
      </div>

      <div className="rxn-stats">
        <Stat num={stats.product} label="Product formed" />
        <Stat num={stats.rate} label="Reactions / sec" />
        <Stat num={stats.remaining} label="Reactant particles left" />
      </div>

      <button type="button" className="rxn-reset" onClick={resetExperiment}>
        Reset experiment
      </button>

      <div className="rxn-quiz-section">
        {!showQuestions ? (
          <button type="button" className="rxn-reveal" onClick={() => setShowQuestions(true)}>
            Show the check-your-understanding questions <ChevronDown />
          </button>
        ) : (
          <>
            <p className="rxn-quiz-label">Check your understanding</p>
            {QUESTIONS.map((q, qi) => (
              <QuizQuestion key={qi} index={qi} question={q} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="rxn-legend-item">
      <span className="rxn-legend-dot" style={{ background: color }} />
      {label}
    </span>
  );
}

function Control({ id, label, info, value, min, max, onChange }) {
  return (
    <div>
      <label className="rxn-control-label" htmlFor={id}>
        <span className="rxn-control-label-text">
          {label}
          <InfoBadge text={info} />
        </span>
        <span className="rxn-control-value">{value}</span>
      </label>
      <input
        id={id}
        type="range"
        className="rxn-slider"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function InfoBadge({ text }) {
  return (
    <span className="rxn-tip">
      <button type="button" className="rxn-info-btn" aria-label={`More info: ${text}`}>?</button>
      <span className="rxn-tip-bubble" role="tooltip">{text}</span>
    </span>
  );
}

function Stat({ num, label }) {
  return (
    <div className="rxn-stat">
      <div className="rxn-stat-num">{num}</div>
      <div className="rxn-stat-label">{label}</div>
    </div>
  );
}

const QUESTIONS = [
  {
    prompt: "At the start of the simulation (low temperature, high activation energy), what do you notice about the collisions between Reactants A and B?",
    options: [
      { text: "Most collisions immediately produce a green product", correct: false, feedback: "Watch again, at this activation energy, collisions don’t carry enough energy to react; they just bounce apart." },
      { text: "The particles just bounce apart when they collide", correct: true, feedback: "Correct. At this activation energy threshold, collisions don’t have enough energy to cause a reaction, so they bounce apart instead." },
      { text: "The particles pass through each other without colliding", correct: false, feedback: "They do collide; look for the moment two circles touch. When they do, they just bounce apart rather than reacting." },
    ],
  },
  {
    prompt: "What happens when you lower the Activation Energy slider?",
    options: [
      { text: "The reaction rate increases, because collisions now need less energy to clear the threshold required for a reaction to take place", correct: true, feedback: "Correct. Lowering the Activation Energy slider doesn’t change how the particles move, it changes the threshold for a reaction to occur." },
      { text: "The reaction rate increases, because the particles start moving faster", correct: false, feedback: "Activation energy doesn’t affect particle speed, only temperature does. Try it again and watch the particles’ speed." },
      { text: "The reaction rate decreases, because the reaction becomes less sensitive", correct: false, feedback: "The opposite: a lower activation energy makes reactions easier, not less likely." },
    ],
  },
  {
    prompt: "What happens when you raise the Temperature slider?",
    options: [
      { text: "The reaction rate increases, because particles collide more often and with more energy", correct: true, feedback: "Correct. Temperature does two things at once: particles move faster, so they collide more often, and each collision carries more energy, making it more likely to clear the threshold required for a reaction to occur." },
      { text: "The reaction rate increases, but only because collisions happen more often", correct: false, feedback: "That’s half the story: faster particles also hit harder, not just more often." },
      { text: "The reaction rate increases, but only because each collision carries more energy", correct: false, feedback: "That’s half the story: faster particles also collide more often, not just harder." },
    ],
  },
  {
    prompt: "Two A/B collisions happen at the same temperature. One is a direct, head-on meeting; the other is a glancing touch between particles moving at similar speeds. Which is more likely to cause a reaction?",
    options: [
      { text: "The glancing collision", correct: false, feedback: "The other way around: a glancing touch between similarly-moving particles produces a smaller relative speed, so it’s less likely to clear the threshold." },
      { text: "The head-on collision", correct: true, feedback: "Correct. A head-on meeting produces a bigger difference in velocity between the two particles at the moment of impact, which is what the simulation actually checks." },
      { text: "They’re equally likely to cause a reaction as the angle of the collision makes no difference", correct: false, feedback: "Angle does matter here: it changes the relative speed between the two particles, which is exactly what determines success." },
    ],
  },
];

const OPTION_LETTERS = ["A", "B", "C", "D"];

function QuizQuestion({ index, question }) {
  const [selected, setSelected] = useState(null);
  const answered = selected !== null;
  const answeredCorrect = answered && question.options[selected].correct;

  return (
    <div className="rxn-quiz-q">
      <div className="rxn-quiz-head">
        <span className="rxn-quiz-num">{index + 1}</span>
        <p className="rxn-quiz-prompt">{question.prompt}</p>
      </div>
      {question.options.map((opt, oi) => {
        const isSelected = selected === oi;
        const stateClass = isSelected ? (opt.correct ? " selected correct" : " selected incorrect") : "";
        return (
          <button
            key={oi}
            type="button"
            className={`rxn-quiz-opt${stateClass}`}
            onClick={() => setSelected(oi)}
          >
            <span className="rxn-quiz-opt-marker">
              {isSelected ? (opt.correct ? "✓" : "✕") : OPTION_LETTERS[oi]}
            </span>
            <span className="rxn-quiz-opt-text">{opt.text}</span>
          </button>
        );
      })}
      {answered && (
        <div className={`rxn-quiz-feedback ${answeredCorrect ? "correct" : "incorrect"}`}>
          <span className="rxn-quiz-feedback-icon">{answeredCorrect ? "✓" : "✕"}</span>
          <span>{question.options[selected].feedback}</span>
        </div>
      )}
    </div>
  );
}
