// Single source of truth for every portfolio piece — feeds both the category
// grid cards and the piece detail pages, so copy only ever lives in one place.
export const categories = {
  interactive: {
    slug: 'interactive',
    file: 'category-interactive',
    label: 'Interactive Learning Experiences',
    blurb: 'Simulations, explorables, and scenarios built to generate understanding through exploration — not just present it.',
  },
  assessment: {
    slug: 'assessment',
    file: 'category-assessment',
    label: 'Assessment Strategies & Design',
    blurb: 'Backward-designed curriculum, criterion-referenced rubrics, and outcome unpacking, from plan through to gradeable criteria.',
  },
  products: {
    slug: 'products',
    file: 'category-products',
    label: 'Educational Products',
    blurb: 'Build tooling, course pages, and field-ready materials, ready to hand to a team or a learner.',
  },
};

export const pieces = [
  // ── Interactive Learning Experiences ──
  {
    slug: 'natural-selection-explorable', category: 'interactive', tag: 'Senior Secondary',
    title: 'Natural Selection Explorable',
    is: 'Hunt a population of moths and breed the survivors to see natural selection in action, generation by generation.',
    demonstrates: 'Designing interaction that builds conceptual understanding.',
    island: 'NaturalSelection',
  },
  {
    slug: 'simpsons-paradox-explorable', category: 'interactive', tag: 'Tertiary Education',
    title: "Simpson's Paradox Explorable",
    is: 'A sales-data scenario built around two sales reps whose individual performance trends reverse once the data is combined, letting the learner discover the paradox by manipulating the groupings themselves.',
    demonstrates: 'Turning a counterintuitive statistical concept into something a learner can test and see for themselves.',
  },
  {
    slug: 'cumulative-advantage-explorable', category: 'interactive', tag: 'Tertiary Education',
    title: 'Cumulative Advantage Explorable',
    is: 'Build a music chart one listener at a time and watch a moderately good song snowball into a runaway hit from nothing but an accidental early lead, then compare it against a world where listeners can’t see the charts at all. A recreation of the 2006 Music Lab experiment.',
    demonstrates: 'Modelling a systems-level concept — path dependency — through direct manipulation rather than description.',
    island: 'CumulativeAdvantage',
  },
  {
    slug: 'metacognition-literature-review', category: 'interactive', tag: 'Professional Development',
    title: 'Metacognition & Self-Directed Learning',
    is: 'An interactive literature review for educators, walking through metacognitive theory and its link to self-directed learning via a guided journey: a baseline self-assessment, seven concept-building activities, and a personal action plan generated from your own responses.',
    demonstrates: 'Turning a reference document into a structured learning experience — teaching the underlying five-stage instructional model by having the reader move through it themselves.',
    island: 'MetacognitionLab',
  },
  {
    slug: 'milltown-recession-simulation', category: 'interactive', tag: 'Tertiary Education',
    title: 'Milltown Recession Simulation',
    is: 'A shock-and-intervention matrix across three linked businesses in a fictional town during a downturn, where an intervention on one business visibly affects the other two.',
    demonstrates: 'A simulation with genuine systemic interdependency between businesses, not a single isolated variable.',
  },
  {
    slug: 'branching-safety-scenario', category: 'interactive', tag: 'Vocational Training',
    title: 'Branching Safety-Judgment Scenario',
    is: 'A decision-tree scenario set in a field situation, where each choice leads to a different, realistic consequence rather than a simple right or wrong flag.',
    demonstrates: 'Applying the same interaction design skill to procedural and safety judgement, not just conceptual understanding.',
  },
  {
    slug: 'reaction-rate-simulator', category: 'interactive', tag: 'Concept',
    title: 'Reaction Rate Simulator',
    is: 'A live particle collision simulation, driven by two continuous sliders (temperature and activation energy) instead of discrete choices, so cause and effect in collision theory update smoothly as the inputs change.',
    demonstrates: 'A different simulation mechanic: continuous cause-and-effect rather than discrete decisions.',
    island: 'ReactionRateSimulator',
  },
  {
    slug: 'sort-and-categorise-interactive', category: 'interactive', tag: 'Concept',
    title: 'Sort & Categorise Interactive',
    is: 'A drag-to-classify activity built around one specific, commonly confused distinction, with immediate feedback on each item sorted.',
    demonstrates: 'A lighter-weight interactive format for smaller-scope briefs.',
  },

  // ── Assessment Strategies & Design ──
  {
    slug: 'backward-design-unit-plan', category: 'assessment', tag: 'Tertiary Education',
    title: 'Backward-Design Unit Plan',
    is: 'An exemplar unit plan on invented subject matter, showing outcomes, assessment, and learning activities built in that order and kept aligned throughout.',
    demonstrates: 'Backward design and constructive alignment applied end-to-end, not just described.',
  },
  {
    slug: 'interactive-alignment-map', category: 'assessment', tag: 'Tertiary Education',
    title: 'Interactive Alignment Map',
    is: 'Select a learning outcome and trace it live through to the shared assessment task it feeds, the activities that build toward it, and the content it draws on — then reveal the sequenced learning plan that ties them together.',
    demonstrates: 'Making an alignment structure genuinely inspectable, rather than a static table.',
    island: 'AlignmentMap',
  },
  {
    slug: 'solo-rubric-explorer', category: 'assessment', tag: 'Tertiary Education',
    title: 'SOLO Rubric Explorer',
    is: 'Select one of five student responses to an economics task and see it graded live against three criteria, each written along the SOLO taxonomy’s progression from a single disconnected idea through to a fully integrated, self-questioning argument.',
    demonstrates: 'Criterion-writing expertise paired directly with interaction design.',
    island: 'SoloRubric',
  },
  {
    slug: 'slo-unpacking-exemplar', category: 'assessment', tag: 'Tertiary Education',
    title: 'SLO Unpacking Exemplar',
    is: 'A raw subject learning outcome shown side by side with its unpacked knowledge-and-skills breakdown.',
    demonstrates: 'The unpacking method used to turn a broad outcome into assessable, verb-faithful criteria.',
  },
  {
    slug: 'competency-checklist', category: 'assessment', tag: 'Vocational Training',
    title: 'Digital Competency Checklist',
    is: 'A field-ready checklist a supervisor can use on the spot to verify a task has been performed to standard, structured around observable steps.',
    demonstrates: 'Assessment designed for observed, real-world competence rather than recall.',
  },

  // ── Educational Products ──
  {
    slug: 'build-pipeline-diagram', category: 'products', tag: 'Systems & Tooling',
    title: 'Build Pipeline Diagram',
    is: 'A diagram tracing a machine-readable course spec through to an automated, ready-to-import Canvas package.',
    demonstrates: 'Systems thinking applied to course production, not just individual course design.',
  },
  {
    slug: 'canvas-page-mockup', category: 'products', tag: 'Tertiary Education',
    title: 'Canvas Page Mockup',
    is: 'A rendered replica of a styled Canvas topic page, built on invented content.',
    demonstrates: 'Attention to the actual delivery surface a learner sees, not just the underlying design.',
  },
  {
    slug: 'build-tool-demo', category: 'products', tag: 'Systems & Tooling',
    title: 'Live Build-Tool Demo',
    is: 'An in-browser tool: paste in a rough lesson outline, and watch it turn into a structured quiz or interactive skeleton.',
    demonstrates: 'The automation value directly, by doing it in front of the visitor rather than describing it.',
  },
  {
    slug: 'annotated-build-walkthrough', category: 'products', tag: 'Tertiary Education',
    title: 'Annotated Build Walkthrough',
    is: 'A short before-and-after sequence of screenshots showing raw lesson content turned into a finished, styled Canvas course page.',
    demonstrates: 'The practical, visible difference the build process makes.',
  },
  {
    slug: 'procedural-job-aid', category: 'products', tag: 'Vocational Training',
    title: 'Procedural Job Aid',
    is: 'A one-page field reference breaking a technical procedure into clear, ordered steps, designed to be glanced at mid-task.',
    demonstrates: 'Designing for use in the moment, not just for study in advance.',
  },
];

export function piecesByCategory(categorySlug) {
  return pieces.filter((p) => p.category === categorySlug);
}

export function getPiece(slug) {
  return pieces.find((p) => p.slug === slug);
}
