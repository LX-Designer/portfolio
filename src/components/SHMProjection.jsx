import { useEffect, useRef, useState, useMemo } from "react";

// Simple Harmonic Motion as the projection of uniform circular motion.
// Built fresh (not templated off another asset) but follows this site's
// established island shape: a light card wrapper using the site's design
// tokens, wrapped around a self-contained dark "stage" that carries the
// neon-on-black visual register of the physics diagram it's based on —
// the same light-card-around-a-dark-canvas split ReactionRateSimulator uses.
//
// Geometry (SVG y grows downward, so sin is negated to put +y up the page):
//   A point P moves counter-clockwise around a circle of radius R at a
//   steady angular speed. Its foot-of-perpendicular M onto the horizontal
//   diameter has displacement x = R·cos θ from the centre — that projection
//   is exactly simple harmonic motion. The companion graph plots that same
//   x against time, tracing the cosine curve one period at a time.

const R = 125, CX = 170, CY = 170;                 // circle stage (viewBox 340×340)
const GX0 = 46, GW = 296, GMY = 170, GAMP = 112;   // graph stage (viewBox 366×340)

// SVG-space position of the orbiting point at a given angle (θ from the
// +x axis / point B, measured counter-clockwise).
function polar(angle) {
  return { x: CX + R * Math.cos(angle), y: CY - R * Math.sin(angle) };
}

const TAU = Math.PI * 2;

export default function SHMProjection() {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // A single source of truth: the angle P has turned through, in [0, 2π).
  // Both the circle and the graph derive everything from it.
  const [angle, setAngle] = useState(Math.PI * 0.62);
  const [playing, setPlaying] = useState(!prefersReduced);
  const [speed, setSpeed] = useState(1.1); // rad/s

  // The loop reads speed live via a ref so changing the slider doesn't tear
  // down and restart the animation effect (which would reset timing).
  const speedRef = useRef(speed);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); // clamp big gaps (tab refocus)
      last = now;
      setAngle((a) => (a + speedRef.current * dt) % TAU);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  const P = polar(angle);
  const xFrac = Math.cos(angle);       // x / A, signed
  const Mx = CX + R * xFrac;           // foot of perpendicular on the diameter
  const deg = Math.round(((angle * 180) / Math.PI) % 360);

  // The full cosine curve, drawn once. The pen rides it; it never needs to
  // be recomputed, so it's memoised rather than rebuilt every frame.
  const graphPath = useMemo(() => {
    let d = "";
    const N = 180;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const th = t * TAU;
      const gx = GX0 + t * GW;
      const gy = GMY - GAMP * Math.cos(th);
      d += (i ? "L" : "M") + gx.toFixed(2) + " " + gy.toFixed(2) + " ";
    }
    return d;
  }, []);
  const penX = GX0 + (angle / TAU) * GW;
  const penY = GMY - GAMP * Math.cos(angle);

  // Plain-language state of the shadow, for the live readout. Near the ends
  // it's momentarily at rest; through the centre it's moving fastest — the
  // defining feel of SHM.
  const nearEnd = Math.abs(xFrac) > 0.985;
  const nearCentre = Math.abs(xFrac) < 0.06;
  const motionNote = nearEnd
    ? "momentarily at rest"
    : nearCentre
    ? "moving fastest"
    : xFrac > 0
    ? "on the B side of centre"
    : "on the D side of centre";

  function scrub(valueDeg) {
    setPlaying(false);
    setAngle(((valueDeg * Math.PI) / 180) % TAU);
  }

  return (
    <div className="shm">
      <style>{`
        .shm{background:var(--bg);border:1px solid var(--line);border-radius:16px;padding:36px 34px;
          font-family:'Inter',sans-serif;color:var(--text);font-size:16px;line-height:1.6;
          container-type:inline-size;}
        .shm *{box-sizing:border-box;}

        .shm-h2{font-family:'Poppins',sans-serif;font-weight:600;font-size:20px;margin:0 0 12px;color:var(--text);}
        .shm-intro{font-size:14.5px;color:var(--text-soft);line-height:1.65;margin:0 0 22px;}
        .shm-intro b{color:var(--text);}

        /* Dark stage carrying the neon diagram's own visual register, sitting
           inside the light card the same way ReactionRateSimulator's canvas does. */
        .shm-stage{background:radial-gradient(120% 120% at 50% 18%,#10151F 0%,#080B12 70%);
          border-radius:16px;padding:18px;margin-bottom:18px;
          display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}
        .shm-panel{flex:1 1 300px;min-width:0;display:flex;flex-direction:column;gap:8px;}
        .shm-panel-cap{font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;
          color:#7E8AA6;text-align:center;font-family:'Inter',sans-serif;}
        .shm-svg{display:block;width:100%;height:auto;}

        .shm-legend{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;padding:2px 4px 0;}
        .shm-legend-item{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#B7C0D8;
          font-family:'Inter',sans-serif;}
        .shm-legend-dot{flex:0 0 9px;width:9px;height:9px;border-radius:50%;display:inline-block;}

        .shm-graph-note{font-size:12.5px;line-height:1.55;color:#93A0C2;text-align:center;
          font-family:'Inter',sans-serif;margin:2px 4px 0;padding:0 6px;}
        .shm-graph-note b{color:#E6ECF5;}

        .shm-controls{display:flex;align-items:center;gap:18px 22px;flex-wrap:wrap;margin-bottom:8px;}
        .shm-play{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600;
          padding:10px 20px;border-radius:999px;border:none;cursor:pointer;background:var(--text);color:#fff;
          font-family:'Inter',sans-serif;transition:background .12s ease;}
        .shm-play:hover{background:#3a3a3a;}
        .shm-play:focus-visible{outline:2px solid var(--blue);outline-offset:2px;}
        .shm-field{display:flex;flex-direction:column;gap:5px;flex:1 1 190px;min-width:170px;}
        .shm-field-label{display:flex;justify-content:space-between;align-items:baseline;
          font-size:12.5px;font-weight:600;}
        .shm-field-label span:last-child{color:var(--blue);font-family:'Poppins',sans-serif;}
        .shm-slider{width:100%;accent-color:var(--blue);}

        .shm-readout{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px;}
        .shm-chip{flex:1;min-width:130px;background:var(--bg-soft);border-radius:12px;padding:11px 15px;}
        .shm-chip-num{font-family:'Poppins',sans-serif;font-size:19px;font-weight:600;}
        .shm-chip-num.disp{color:#1F9C6B;}
        .shm-chip-label{font-size:11.5px;color:var(--text-soft);margin-top:2px;}

        .shm-explain{margin-top:6px;}
        .shm-eyebrow{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--blue);
          font-weight:700;margin:0 0 10px;}
        .shm-explain h3{font-family:'Poppins',sans-serif;font-size:16px;font-weight:600;margin:0 0 10px;}
        .shm-explain p{font-size:14px;line-height:1.7;color:var(--text-soft);margin:0 0 14px;}
        .shm-explain p:last-child{margin-bottom:0;}
        .shm-explain b{color:var(--text);}
        .shm-key{background:var(--blue-bg);border-radius:12px;padding:18px 20px;margin-top:20px;}
        .shm-key-title{font-size:13px;font-weight:700;color:var(--text);margin:0 0 12px;}
        .shm-key-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;}
        .shm-key-list li{display:flex;gap:11px;align-items:flex-start;font-size:13.5px;line-height:1.55;
          color:var(--text-soft);}
        .shm-key-list b{color:var(--text);}
        .shm-swatch{flex:0 0 14px;width:14px;height:14px;border-radius:4px;margin-top:2px;}
        .shm-eq{font-family:'IBM Plex Mono','Courier New',monospace;background:#fff;border:1px solid var(--line);
          border-radius:6px;padding:1px 6px;font-size:13px;color:var(--text);white-space:nowrap;}

        /* Bolded standalone statement — used to bookend the piece (the intro's
           one-line thesis and the closing "big idea" both get the same
           treatment, so they read as a matched pair). */
        .shm-statement{font-size:15.5px;font-weight:700;color:var(--text);line-height:1.5;
          background:var(--blue-bg);border-radius:12px;padding:14px 18px;margin:0 0 22px;}
        .shm-bigidea .shm-statement{margin:0 0 12px;}

        .shm-eq-block{background:var(--bg-soft);border-radius:12px;padding:16px 20px;margin:0 0 20px;}
        .shm-eq-block-label{font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;
          color:var(--text-soft);margin:0 0 10px;}
        .shm-eq-lg{font-size:16px;padding:5px 10px;margin:0 0 10px;display:inline-block;}
        .shm-eq-legend{font-size:13px;line-height:1.6;color:var(--text-soft);margin:0;}
        .shm-eq-legend b{font-family:'IBM Plex Mono','Courier New',monospace;color:var(--text);}

        .shm-bigidea{margin-top:22px;padding-top:20px;border-top:1px solid var(--line);}

        @container (max-width:520px){
          .shm-stage{flex-direction:column;}
        }
        @media (max-width:600px){
          .shm{padding:18px 4px;border:none;border-radius:0;}
          .shm-intro,.shm-explain,.shm-controls,.shm-readout{padding-left:12px;padding-right:12px;}
        }
      `}</style>

      <h2 className="shm-h2">Simple harmonic motion, hiding inside a circle</h2>
      <p className="shm-intro">
        Simple harmonic motion (SHM) is a particular kind of smooth, repeating back-and-forth motion. A mass
        on a spring is one example, and a pendulum behaves approximately like SHM when it swings through
        small angles.
      </p>
      <p className="shm-intro">
        SHM can seem like its own special kind of motion, but there is a surprisingly simple way to picture
        it. Imagine a dot travelling around a circle at a constant speed, and follow only its shadow on the
        horizontal axis.
      </p>
      <p className="shm-statement">That shadow moves in simple harmonic motion.</p>

      <div className="shm-stage">
        <div className="shm-panel">
          <div className="shm-panel-cap">The dot and its shadow</div>
          <svg className="shm-svg" viewBox="0 0 340 340" role="img"
            aria-label="A dot moving around a circle, with a vertical line dropping to its shadow on the horizontal diameter.">
            <defs>
              <filter id="shmGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2.4" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <radialGradient id="shmDot" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#ffd3ec" />
                <stop offset="100%" stopColor="#ff5db4" />
              </radialGradient>
            </defs>

            {/* faint construction: radius to the point, and the vertical diameter */}
            <line x1={CX} y1={CY} x2={P.x} y2={P.y} stroke="rgba(240,205,130,0.45)" strokeWidth="1.5" />
            <line x1={CX} y1={CY - R} x2={CX} y2={CY + R} stroke="rgba(230,236,245,0.14)" strokeWidth="1.5" strokeDasharray="3 6" />

            {/* the horizontal diameter: the line the shadow slides along */}
            <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke="rgba(230,236,245,0.55)" strokeWidth="2" filter="url(#shmGlow)" />

            {/* the circle */}
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#E6ECF5" strokeWidth="2" filter="url(#shmGlow)" />

            {/* green displacement: centre O to the shadow M (x = A·cos θ) */}
            <line x1={CX} y1={CY} x2={Mx} y2={CY} stroke="#54E39B" strokeWidth="4" strokeLinecap="round" filter="url(#shmGlow)" />

            {/* blue perpendicular from the point down to its shadow */}
            <line x1={P.x} y1={P.y} x2={Mx} y2={CY} stroke="#7C8CFF" strokeWidth="3" strokeLinecap="round" filter="url(#shmGlow)" />

            {/* shadow point on the diameter */}
            <circle cx={Mx} cy={CY} r="5" fill="#54E39B" filter="url(#shmGlow)" />

            {/* centre O */}
            <circle cx={CX} cy={CY} r="3.5" fill="none" stroke="#E6ECF5" strokeWidth="1.5" />
            <text x={CX - 12} y={CY + 18} fill="#8894B0" fontFamily="'IBM Plex Mono',monospace" fontSize="12">O</text>

            {/* the orbiting point */}
            <circle cx={P.x} cy={P.y} r="16" fill="#ff5db4" opacity="0.28" filter="url(#shmGlow)" />
            <circle cx={P.x} cy={P.y} r="8" fill="url(#shmDot)" filter="url(#shmGlow)" />

            {/* labels */}
            <text x={CX} y="24" textAnchor="middle" fill="#63E6DA" fontFamily="'IBM Plex Mono',monospace" fontSize="16">A</text>
            <text x="330" y="176" textAnchor="middle" fill="#63E6DA" fontFamily="'IBM Plex Mono',monospace" fontSize="16">B</text>
            <text x={CX} y="332" textAnchor="middle" fill="#63E6DA" fontFamily="'IBM Plex Mono',monospace" fontSize="16">C</text>
            <text x="10" y="176" textAnchor="middle" fill="#63E6DA" fontFamily="'IBM Plex Mono',monospace" fontSize="16">D</text>
          </svg>
          <div className="shm-legend">
            <span className="shm-legend-item">
              <span className="shm-legend-dot" style={{ background: "radial-gradient(circle,#fff,#ff5db4)" }} />
              Orbiting point
            </span>
            <span className="shm-legend-item">
              <span className="shm-legend-dot" style={{ background: "#54E39B" }} />
              Shadow (its projection)
            </span>
            <span className="shm-legend-item">
              <span className="shm-legend-dot" style={{ background: "#7C8CFF" }} />
              Perpendicular drop
            </span>
            <span className="shm-legend-item">
              <span className="shm-legend-dot" style={{ background: "#F0CD82" }} />
              Radius
            </span>
          </div>
        </div>

        <div className="shm-panel">
          <div className="shm-panel-cap">Shadow's displacement over time</div>
          <svg className="shm-svg" viewBox="0 0 366 340" role="img"
            aria-label="A displacement versus time graph tracing a cosine curve, with a pen showing the shadow's current position.">
            {/* axes */}
            <line x1={GX0} y1={GMY} x2={GX0 + GW + 8} y2={GMY} stroke="rgba(230,236,245,0.35)" strokeWidth="1.5" />
            <line x1={GX0} y1={GMY - GAMP - 14} x2={GX0} y2={GMY + GAMP + 14} stroke="rgba(230,236,245,0.35)" strokeWidth="1.5" />

            {/* amplitude guide lines */}
            <line x1={GX0} y1={GMY - GAMP} x2={GX0 + GW} y2={GMY - GAMP} stroke="rgba(84,227,155,0.18)" strokeWidth="1" strokeDasharray="2 6" />
            <line x1={GX0} y1={GMY + GAMP} x2={GX0 + GW} y2={GMY + GAMP} stroke="rgba(84,227,155,0.18)" strokeWidth="1" strokeDasharray="2 6" />

            {/* axis labels */}
            <text x={GX0 - 8} y={GMY - GAMP + 4} textAnchor="end" fill="#8894B0" fontFamily="'IBM Plex Mono',monospace" fontSize="11">+A</text>
            <text x={GX0 - 8} y={GMY + 4} textAnchor="end" fill="#8894B0" fontFamily="'IBM Plex Mono',monospace" fontSize="11">0</text>
            <text x={GX0 - 8} y={GMY + GAMP + 4} textAnchor="end" fill="#8894B0" fontFamily="'IBM Plex Mono',monospace" fontSize="11">−A</text>
            <text x={GX0 + GW + 2} y={GMY + 20} textAnchor="end" fill="#8894B0" fontFamily="'IBM Plex Mono',monospace" fontSize="11">time →</text>

            {/* the cosine curve */}
            <path d={graphPath} fill="none" stroke="#E6ECF5" strokeWidth="2.5" filter="url(#shmGlow)" opacity="0.92" />

            {/* pen: current position */}
            <line x1={penX} y1={GMY - GAMP - 10} x2={penX} y2={GMY + GAMP + 10} stroke="rgba(230,236,245,0.22)" strokeWidth="1" />
            <line x1={penX} y1={GMY} x2={penX} y2={penY} stroke="#54E39B" strokeWidth="4" strokeLinecap="round" filter="url(#shmGlow)" />
            <circle cx={penX} cy={penY} r="7" fill="url(#shmDot)" filter="url(#shmGlow)" />
          </svg>
          <p className="shm-graph-note">
            The curve's slope tells you the shadow's <b>velocity</b>. The curve is steepest as the shadow
            passes through the centre, where it is moving fastest. At each peak, the curve is horizontal:
            the shadow momentarily stops before changing direction.
          </p>
        </div>
      </div>

      <div className="shm-controls">
        <button type="button" className="shm-play" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
          {playing ? "❚❚ Pause" : "► Play"}
        </button>
        <div className="shm-field">
          <label className="shm-field-label" htmlFor="shm-speed">
            <span>Speed</span><span>{speed.toFixed(1)} rad/s</span>
          </label>
          <input id="shm-speed" className="shm-slider" type="range" min="0.3" max="2.5" step="0.1"
            value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        </div>
        <div className="shm-field">
          <label className="shm-field-label" htmlFor="shm-pos">
            <span>Position (drag to explore)</span><span>{deg}°</span>
          </label>
          <input id="shm-pos" className="shm-slider" type="range" min="0" max="359" step="1"
            value={((deg % 360) + 360) % 360} onChange={(e) => scrub(Number(e.target.value))} />
        </div>
      </div>

      <div className="shm-readout">
        <div className="shm-chip">
          <div className="shm-chip-num">{deg}°</div>
          <div className="shm-chip-label">Angle turned through (θ)</div>
        </div>
        <div className="shm-chip">
          <div className="shm-chip-num disp">{(xFrac >= 0 ? "+" : "−") + Math.abs(xFrac).toFixed(2)} A</div>
          <div className="shm-chip-label">Shadow displacement</div>
        </div>
        <div className="shm-chip">
          <div className="shm-chip-num" style={{ fontSize: 15, fontWeight: 500 }}>{motionNote}</div>
          <div className="shm-chip-label">What the shadow is doing</div>
        </div>
      </div>

      <div className="shm-explain">
        <div className="shm-eyebrow">What you're seeing</div>
        <h3>A steady circle, an uneven shadow</h3>
        <p>
          The pink dot moves around the circle at a constant speed — this is <b>uniform circular motion</b>.
          Drop a straight line (blue) from the dot down to the horizontal diameter. Where it lands is the
          dot's shadow, and the green segment shows how far that shadow is from the centre O.
        </p>
        <p>
          As the dot completes one full circle, the shadow moves from one extreme to the other, back through
          the centre, and then back again — completing one full oscillation.
        </p>
        <p>
          Notice how the shadow moves. It is <b>fastest as it passes through the centre</b> and slows down
          until it momentarily stops at each extreme, before changing direction. Its speed is constantly
          changing, even though the dot travels around the circle at a constant speed.
        </p>
        <p>
          This changing speed is a key feature of simple harmonic motion. It appears naturally when uniform
          circular motion is projected onto a straight line.
        </p>
        <p>
          The graph on the right shows the shadow's displacement over time. As the dot moves around the
          circle, its horizontal position follows a cosine pattern, so the shadow's displacement forms a{" "}
          <b>cosine curve</b>.
        </p>

        <div className="shm-eq-block">
          <p className="shm-eq-block-label">Mathematically</p>
          <p className="shm-eq shm-eq-lg">x = A·cos θ = A·cos(ωt)</p>
          <p className="shm-eq-legend">
            where <b>A</b> is the amplitude, <b>θ</b> is the angle the dot has turned through, <b>ω</b> is
            the angular speed, and <b>t</b> is time.
          </p>
        </div>

        <div className="shm-key">
          <p className="shm-key-title">The relationships to hold onto</p>
          <ul className="shm-key-list">
            <li>
              <span className="shm-swatch" style={{ background: "#E6ECF5" }} />
              <span><b>Amplitude (A)</b> is the radius of the circle — the greatest distance the shadow reaches from the centre.</span>
            </li>
            <li>
              <span className="shm-swatch" style={{ background: "#54E39B" }} />
              <span><b>Displacement (x)</b> is the shadow's position relative to the centre: <span className="shm-eq">x = A·cos θ = A·cos(ωt)</span></span>
            </li>
            <li>
              <span className="shm-swatch" style={{ background: "#7C8CFF" }} />
              <span><b>Period (T)</b> is the time for the dot to complete one full circle. This is also the time for the shadow to complete one full oscillation.</span>
            </li>
            <li>
              <span className="shm-swatch" style={{ background: "var(--blue)" }} />
              <span>The shadow is also always <b>accelerated towards the centre</b>. This restoring acceleration is what continually brings the shadow back towards its equilibrium position.</span>
            </li>
          </ul>
        </div>

        <div className="shm-bigidea">
          <div className="shm-eyebrow">The big idea</div>
          <p className="shm-statement">The projection of uniform circular motion onto a diameter produces simple harmonic motion.</p>
          <p>
            The circle therefore gives us a useful way to picture SHM: a steady circular motion creates the
            smooth, repeating back-and-forth motion we see in the shadow.
          </p>
        </div>
      </div>
    </div>
  );
}
