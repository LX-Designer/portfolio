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
  'k12': 'K-12',
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
    cardBody: "This explorable demonstrates an experiential approach to building conceptual understanding. Learners hunt moths in a simulated environment and breed the survivors to observe natural selection in action. They apply what they've learned by identifying the same mechanism at work in other real-world scenarios.",
  },
  {
    slug: 'simpsons-paradox-explorable', category: 'interactive', tag: 'Tertiary Education',
    sector: 'higher-ed', type: 'interactive',
    title: "Simpson's Paradox Explorable",
    is: 'A sales-data scenario built around two sales reps whose individual performance trends reverse once the data is combined, letting the learner discover the paradox by manipulating the groupings themselves.',
    demonstrates: 'Turning a counterintuitive statistical concept into something a learner can test and see for themselves.',
  },
  {
    slug: 'cumulative-advantage-explorable', category: 'interactive', tag: 'Tertiary Education',
    sector: 'higher-ed', type: 'interactive',
    title: 'Cumulative Advantage Explorable',
    is: 'Build a music chart one listener at a time and watch a moderately good song snowball into a runaway hit from nothing but an accidental early lead, then compare it against a world where listeners can’t see the charts at all. A recreation of the 2006 Music Lab experiment.',
    demonstrates: 'Modelling a systems-level concept — path dependency — through direct manipulation rather than description.',
    island: 'CumulativeAdvantage',
    // Card-only override: this card's body copy differs from the "is" text
    // used on its own standalone page.
    cardBody: 'This explorable demonstrates a discovery-based approach to conceptual understanding. Learners build the same music chart across several simulated worlds, then observe how an initial, random advantage leads to wildly different results. This phenomenon is then exemplified through additional real-world examples.',
  },
  {
    slug: 'metacognition-literature-review', category: 'interactive', tag: 'Professional Development',
    sector: 'lnd', type: 'interactive',
    title: 'Metacognition & Self-Directed Learning',
    is: 'An interactive literature review for educators, walking through metacognitive theory and its link to self-directed learning via a guided journey: a baseline self-assessment, seven concept-building activities, and a personal action plan generated from your own responses.',
    demonstrates: 'Turning a reference document into a structured learning experience — teaching the underlying five-stage instructional model by having the reader move through it themselves.',
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
    title: 'Tacoma Narrows: The Bridge That Shouldn\'t Have Failed',
    is: 'An inquiry-based case file on the 1940 Tacoma Narrows Bridge collapse, for undergraduate physics and engineering. Examine wind and oscillation data, weigh two competing expert accounts, and use a built-in physics toolkit to write a tribunal report explaining the actual failure mechanism.',
    demonstrates: 'Structuring a case investigation so the "right answer" is discoverable but not given: competing expert claims that sound equally plausible until the learner tests them against the data themselves.',
    island: 'TacomaNarrowsLab',
    // Card-only override: this card's body copy differs from the "is" text
    // used on its own standalone page.
    cardBody: 'This inquiry lab demonstrates a case-based approach to conceptual understanding. Learners work through a primary-source case file — data tables, an engineering sign-off, and two conflicting expert witness statements — using a physics toolkit to test each claim. Six embedded activities build toward a written tribunal report explaining the actual failure mechanism.',
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
    slug: 'milltown-recession-simulation', category: 'interactive', tag: 'Tertiary Education',
    sector: 'higher-ed', type: 'interactive',
    title: 'Milltown Recession Simulation',
    is: 'A shock-and-intervention matrix across three linked businesses in a fictional town during a downturn, where an intervention on one business visibly affects the other two.',
    demonstrates: 'A simulation with genuine systemic interdependency between businesses, not a single isolated variable.',
  },
  {
    slug: 'branching-safety-scenario', category: 'interactive', tag: 'Vocational Training',
    sector: 'lnd', type: 'interactive',
    title: 'Branching Safety-Judgment Scenario',
    is: 'A decision-tree scenario set in a field situation, where each choice leads to a different, realistic consequence rather than a simple right or wrong flag.',
    demonstrates: 'Applying the same interaction design skill to procedural and safety judgement, not just conceptual understanding.',
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
    cardBody: 'This explorable demonstrates an observational approach to helping learners build conceptual understanding. It allows learners to manipulate variables in an experiment and observe the results, then checks their understanding of the concept (collision theory) via a question set.',
  },
  {
    slug: 'sort-and-categorise-interactive', category: 'interactive', tag: 'Concept',
    sector: 'k12', type: 'interactive',
    title: 'Sort & Categorise Interactive',
    is: 'A drag-to-classify activity built around one specific, commonly confused distinction, with immediate feedback on each item sorted.',
    demonstrates: 'A lighter-weight interactive format for smaller-scope briefs.',
  },

  // ── Assessment Strategies & Design ──
  {
    slug: 'backward-design-unit-plan', category: 'assessment', tag: 'Tertiary Education',
    sector: 'higher-ed', type: 'assessment',
    title: 'Backward-Design Unit Plan',
    is: 'An exemplar unit plan on invented subject matter, showing outcomes, assessment, and learning activities built in that order and kept aligned throughout.',
    demonstrates: 'Backward design and constructive alignment applied end-to-end, not just described.',
  },
  {
    slug: 'interactive-alignment-map', category: 'assessment', tag: 'Tertiary Education',
    sector: 'higher-ed', type: 'assessment',
    title: 'Interactive Alignment Map',
    is: 'Select a learning outcome and trace it live through to the shared assessment task it feeds, the activities that build toward it, and the content it draws on — then reveal the sequenced learning plan that ties them together.',
    demonstrates: 'Making an alignment structure genuinely inspectable, rather than a static table.',
    island: 'AlignmentMap',
  },
  {
    slug: 'solo-rubric-explorer', category: 'assessment', tag: 'Tertiary Education',
    sector: 'higher-ed', type: 'assessment',
    title: 'SOLO Rubric Explorer',
    is: 'Select one of five student responses to an economics task and see it graded live against three criteria, each written along the SOLO taxonomy’s progression from a single disconnected idea through to a fully integrated, self-questioning argument.',
    demonstrates: 'Criterion-writing expertise paired directly with interaction design.',
    island: 'SoloRubric',
  },
  {
    slug: 'slo-unpacking-exemplar', category: 'assessment', tag: 'Tertiary Education',
    sector: 'higher-ed', type: 'assessment',
    title: 'SLO Unpacking Exemplar',
    is: 'A raw subject learning outcome shown side by side with its unpacked knowledge-and-skills breakdown.',
    demonstrates: 'The unpacking method used to turn a broad outcome into assessable, verb-faithful criteria.',
  },
  {
    slug: 'competency-checklist', category: 'assessment', tag: 'Vocational Training',
    sector: 'lnd', type: 'assessment',
    title: 'Digital Competency Checklist',
    is: 'A field-ready checklist a supervisor can use on the spot to verify a task has been performed to standard, structured around observable steps.',
    demonstrates: 'Assessment designed for observed, real-world competence rather than recall.',
  },

  // ── Educational Products ──
  {
    slug: 'build-pipeline-diagram', category: 'products', tag: 'Systems & Tooling',
    sector: 'higher-ed', type: 'teacher-resources',
    title: 'Build Pipeline Diagram',
    is: 'A diagram tracing a machine-readable course spec through to an automated, ready-to-import Canvas package.',
    demonstrates: 'Systems thinking applied to course production, not just individual course design.',
  },
  {
    slug: 'canvas-page-mockup', category: 'products', tag: 'Tertiary Education',
    sector: 'higher-ed', type: 'teacher-resources',
    title: 'Canvas Page Mockup',
    is: 'A rendered replica of a styled Canvas topic page, built on invented content.',
    demonstrates: 'Attention to the actual delivery surface a learner sees, not just the underlying design.',
  },
  {
    slug: 'build-tool-demo', category: 'products', tag: 'Systems & Tooling',
    sector: 'lnd', type: 'teacher-resources',
    title: 'Live Build-Tool Demo',
    is: 'An in-browser tool: paste in a rough lesson outline, and watch it turn into a structured quiz or interactive skeleton.',
    demonstrates: 'The automation value directly, by doing it in front of the visitor rather than describing it.',
  },
  {
    slug: 'annotated-build-walkthrough', category: 'products', tag: 'Tertiary Education',
    sector: 'higher-ed', type: 'teacher-resources',
    title: 'Annotated Build Walkthrough',
    is: 'A short before-and-after sequence of screenshots showing raw lesson content turned into a finished, styled Canvas course page.',
    demonstrates: 'The practical, visible difference the build process makes.',
  },
  {
    slug: 'procedural-job-aid', category: 'products', tag: 'Vocational Training',
    sector: 'lnd', type: 'teacher-resources',
    title: 'Procedural Job Aid',
    is: 'A one-page field reference breaking a technical procedure into clear, ordered steps, designed to be glanced at mid-task.',
    demonstrates: 'Designing for use in the moment, not just for study in advance.',
  },
];

export function getPiece(slug) {
  return pieces.find((p) => p.slug === slug);
}
