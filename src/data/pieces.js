// Single source of truth for every portfolio piece — feeds both the homepage
// catalogue and the piece detail pages, so copy only ever lives in one place.

// Sector: which market the piece is aimed at (feeds the homepage catalogue's
// sector filter). Type mirrors `category` 1:1 today — kept as its own field
// (rather than deriving from category) so the catalogue filter's vocabulary
// ("Teacher Resources") can diverge from the category page's ("Educational
// Products") without the two having to stay in lockstep.
export const sectors = {
  'higher-ed': 'Higher Ed',
  'lnd': 'Learning & Development',
  'k12': 'Senior Secondary',
  'vet': 'VET',
};

export const pieceTypes = {
  interactive: 'Interactive Learning Experience',
  assessment: 'Assessment',
  'teacher-resources': 'Teacher Resources',
};

export const pieces = [
  // ── Interactive Learning Experiences ──
  {
    slug: 'natural-selection-explorable', category: 'interactive', tag: 'Senior Secondary',
    sector: 'k12', type: 'interactive',
    title: 'Natural Selection Explorable',
    is: 'Hunt a population of moths and breed the survivors to see natural selection in action, generation by generation.',
    demonstrates: 'Designing interaction that builds conceptual understanding.',
    island: 'NaturalSelection',
    // Card-only override: this card's body copy differs from the "is" text
    // used on its own standalone page.
    cardBody: "An interactive demonstrating an experiential approach to building conceptual understanding. Learners hunt moths in a simulated environment and breed the survivors to observe natural selection in action. They apply what they've learned by identifying the same mechanism at work in other real-world scenarios.",
  },
  {
    slug: 'reaction-rate-simulator', category: 'interactive', tag: 'Concept',
    sector: 'k12', type: 'interactive',
    title: 'Reaction Rate Simulator',
    is: 'A live particle collision simulation, driven by two continuous sliders (temperature and activation energy) instead of discrete choices, so cause and effect in collision theory update smoothly as the inputs change.',
    demonstrates: 'A different simulation mechanic: continuous cause-and-effect rather than discrete decisions.',
    island: 'ReactionRateSimulator',
    // Card-only override: this card's body copy differs from the "is" text
    // used on its own standalone page.
    cardBody: 'A chemistry lab simulator that demonstrates an observational approach to building conceptual understanding. Learners manipulate variables and observe the results before checking their understanding of the key features of the concept (collision theory) via a question set.',
  },
  {
    slug: 'metacognition-literature-review', category: 'interactive', tag: 'Professional Development',
    sector: 'lnd', type: 'interactive',
    title: 'Metacognition & Self-Directed Learning',
    is: 'An interactive literature review for educators, walking through metacognitive theory and its link to self-directed learning via a guided journey: a baseline self-assessment, seven concept-building activities, and a personal action plan generated from your own responses.',
    demonstrates: 'Turning a reference document into a structured learning experience, teaching the underlying five-stage instructional model by having the reader move through it themselves.',
    island: 'MetacognitionLab',
    // Card-only override: this card's body copy differs from the "is" text
    // used on its own standalone page.
    cardBody: "An interactive literature review for educators, walking through metacognitive theory and its link to self-directed learning. Built off the latest literature in the field, it's designed as a quick reference that also models the theory it describes, helping educators grasp the key ideas by experiencing them firsthand.",
    // This piece is a long, full-page guided journey (its own sticky nav,
    // multi-stage flow) that doesn't suit the compact preview modal — send
    // it to its standalone page in a new tab instead, like a normal link.
    openInNewTab: true,
    // The asset has its own full-page chrome (topbar, section nav, back
    // link) — render it without the portfolio's own nav/breadcrumb/footer
    // so it reads as its own standalone tool, not an embed in a page.
    standalonePage: true,
  },
  {
    slug: 'tacoma-narrows-inquiry-lab', category: 'interactive', tag: 'Tertiary Education',
    sector: 'higher-ed', type: 'interactive',
    title: 'Physics Investigation: Tacoma Narrows Bridge Collapse',
    is: 'An inquiry-based case file on the 1940 Tacoma Narrows Bridge collapse, for undergraduate physics and engineering. Examine wind and oscillation data, weigh two competing expert accounts, and use a built-in physics toolkit to write a tribunal report explaining the actual failure mechanism.',
    demonstrates: 'Structuring a case investigation so the "right answer" is discoverable but not given: competing expert claims that sound equally plausible until the learner tests them against the data themselves.',
    island: 'TacomaNarrowsLab',
    // Card-only override: this card's body copy differs from the "is" text
    // used on its own standalone page.
    cardBody: 'An immersive learning experience using authentic context. As learners read through the case file, they must apply their understanding of key physics principles to solve the case of the Tacoma Narrows Bridge collapse and present their findings to a tribunal.',
    // This piece is a long, full-page case investigation (its own nav, activity
    // sidebar) that doesn't suit the compact preview modal — send it to its
    // standalone page in a new tab instead, like a normal link.
    openInNewTab: true,
    // The asset has its own full-page chrome (topbar, activity sidebar) —
    // render it without the portfolio's own nav/breadcrumb/footer so it reads
    // as its own standalone tool, not an embed in a page.
    standalonePage: true,
  },
  {
    slug: 'encryption-lesson', category: 'interactive', tag: 'Senior Secondary',
    sector: 'k12', type: 'interactive',
    title: 'Encryption: Keeping Data Secret',
    is: 'An interactive Cambridge A Level Computer Science lesson on encryption. Crack a Caesar cipher by brute force, run a symmetric vs asymmetric key exchange simulation against an eavesdropper, break a password hash guess-and-check style, inspect a real certificate\'s fields, then complete a four-step secure login task and receive a full security audit of the choices made.',
    demonstrates: 'Building a full lesson page as five connected widgets that escalate toward one applied scenario, rather than one interactive dropped into static content.',
    // This piece is a self-contained lesson page (its own topbar, hero, five
    // console widgets) built as static HTML/CSS/JS rather than a React
    // island — served directly via iframe so it renders exactly as designed
    // with no porting risk, same as the other standalone pieces below.
    iframeSrc: '/encryption-lesson/index.html',
    // Card-only override: this card's body copy differs from the "is" text
    // used on its own standalone page.
    cardBody: 'A demo Canvas page built around an interactive exploration of how encryption is used in cyber security. The lesson concludes with a task-based application of the key concepts.',
    // This piece is a full-page lesson with its own topbar and progress
    // indicator that doesn't suit the compact preview modal — send it to its
    // standalone page in a new tab instead, like a normal link.
    openInNewTab: true,
    // The asset has its own full-page chrome (topbar, hero, footer nav) —
    // render it without the portfolio's own nav/breadcrumb/footer so it reads
    // as its own standalone tool, not an embed in a page.
    standalonePage: true,
  },
  {
    slug: 'isolate-first', category: 'interactive', tag: 'Electrical Trades',
    sector: 'vet', type: 'interactive',
    title: 'Safe Isolation Procedure',
    is: 'A safety-critical competency simulation for the electrical trade: isolate a switchboard, prove the circuit dead, terminate an Australian double power point correctly under AS/NZS 3000, then restore and test the outlet. Every action is logged and assessed — reaching into a live circuit ends the attempt immediately, the same way it would in reality.',
    demonstrates: 'Consequence-based assessment for a physical safety procedure: the correct order of operations is what\'s being tested, not just the end result, so a full action trace backs up the verdict rather than a single pass/fail score.',
    // Self-contained SVG-driven simulation with its own drag-and-drop
    // interaction and assessment engine, built as static HTML/CSS/JS rather
    // than a React island — served directly via iframe so it renders exactly
    // as designed with no porting risk, same as the encryption lesson above.
    iframeSrc: '/isolate-first/index.html',
    // Card-only override: this card's body copy differs from the "is" text
    // used on its own standalone page.
    cardBody: 'Work through the full safe isolation procedure on a simulated switchboard and power point — then find out whether your work would be judged competent.',
    // This piece is a full-page assessment tool with its own action log and
    // report that doesn't suit the compact preview modal — send it to its
    // standalone page in a new tab instead, like a normal link.
    openInNewTab: true,
    // The asset has its own full-page chrome (masthead, task brief, footer
    // compliance notice) — render it without the portfolio's own
    // nav/breadcrumb/footer so it reads as its own standalone tool.
    standalonePage: true,
  },
  {
    slug: 'cumulative-advantage-explorable', category: 'interactive', tag: 'Tertiary Education',
    sector: 'higher-ed', type: 'interactive',
    title: 'Cumulative Advantage Explorable',
    is: 'Build a music chart one listener at a time and watch a moderately good song snowball into a runaway hit from nothing but an accidental early lead, then compare it against a world where listeners can’t see the charts at all. A recreation of the 2006 Music Lab experiment.',
    demonstrates: 'Modelling a systems-level concept, path dependency, through direct manipulation rather than description.',
    island: 'CumulativeAdvantage',
    // Card-only override: this card's body copy differs from the "is" text
    // used on its own standalone page.
    cardBody: 'An interactive explorable demonstrating a discovery-based approach to building conceptual understanding. Learners run an experiment across several simulated worlds, observe the results, and check their understanding of the concept (cumulative advantage) via a question set.',
  },
  // Simple Harmonic Motion Explorable (SHMProjection.jsx) is built and wired
  // into [slug].astro but deliberately not catalogued here — the component
  // stays in the repo, ready to re-add, without appearing on the homepage
  // or getting its own routed page in the meantime.

  // ── Assessment Strategies & Design ──
  {
    slug: 'interactive-alignment-map', category: 'assessment', tag: 'Tertiary Education',
    sector: 'higher-ed', type: 'assessment',
    title: 'Constructive Alignment Map',
    is: 'Select a learning outcome and trace it live through to the shared assessment task it feeds, the activities that build toward it, and the content it draws on, then reveal the sequenced learning plan that ties them together.',
    demonstrates: 'Making an alignment structure genuinely inspectable, rather than a static table.',
    island: 'AlignmentMap',
    // Card-only override: this card's body copy differs from the "is" text
    // used on its own standalone page.
    cardBody: 'An interactive course mapping tool that demonstrates how learning outcomes are used to inform the design of assessment tasks, learning activities, and content.',
  },
  {
    slug: 'solo-rubric-explorer', category: 'assessment', tag: 'Tertiary Education',
    sector: 'higher-ed', type: 'assessment',
    title: 'Interactive Assessment Rubric',
    is: 'An interactive rubric that grades a sample response against three criteria. Built on SOLO taxonomy\'s five levels, with plain-language achievement labels adapted from TEQSA\'s assessment design guidance.',
    demonstrates: 'Criterion-writing expertise paired directly with interaction design.',
    island: 'SoloRubric',
  },
];

export function getPiece(slug) {
  return pieces.find((p) => p.slug === slug);
}
