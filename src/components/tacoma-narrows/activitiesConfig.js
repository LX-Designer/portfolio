// Activity definitions for the Tacoma Narrows inquiry lab — drives the
// sidebar list, the ActivityModal's context panel, and ActivityForm's field
// behaviour. responseKey is which property of the saved response object
// holds the student's main answer text.
export const activities = [
  {
    id: 'act-1',
    title: 'Initial hypothesis',
    thinkingMove: 'Hypothesise',
    prompt: 'Before examining any data, write a single sentence explaining why you think the Tacoma Narrows Bridge collapsed on 7 November 1940. This is your starting position, so you can track how your thinking changes across the inquiry.',
    conceptLinks: [],
    evidenceSections: [],
    responseKey: 'hypothesis',
    inputLabel: 'Your hypothesis',
    placeholder: 'In my view, the bridge collapsed because…',
    rows: 6,
    large: false,
    submitLabel: 'Submit',
  },
  {
    id: 'act-2',
    title: 'Frequency analysis',
    thinkingMove: 'Analyse',
    prompt: 'Use the data in §03 to evaluate whether the resonance explanation is consistent with what was recorded on the day of the collapse. It stands or falls on whether the frequencies actually match.',
    sentenceStarters: [
      'The resonance explanation predicts that… however, the data in §03 shows…',
      'The recorded [wind / oscillation / natural] frequency [supports / contradicts] the resonance explanation because…',
    ],
    conceptLinks: [
      { id: 'oscillation',     title: 'Oscillation and natural frequency' },
      { id: 'resonance',       title: 'Resonance' },
      { id: 'vortex-shedding', title: 'Vortex shedding' },
    ],
    evidenceSections: [{ id: 'tn-data', label: '§03 Wind and oscillation data' }],
    responseKey: 'response',
    rows: 8,
    large: true,
    submitLabel: 'Submit',
  },
  {
    id: 'act-3',
    title: 'Timeline reconstruction',
    thinkingMove: 'Analyse',
    prompt: 'The incident data reveals two distinct phases on the day of collapse. Identify what changed between them, and consider whether a single explanation can account for both.',
    sentenceStarters: [
      'In the first phase, the bridge was exhibiting… In the second phase, this changed to…',
      'The shift between phases suggests that a single explanation [can / cannot] account for both because…',
    ],
    conceptLinks: [
      { id: 'oscillation', title: 'Oscillation and natural frequency' },
      { id: 'torsion',     title: 'Torsional oscillation' },
      { id: 'damping',     title: 'Damping' },
    ],
    evidenceSections: [{ id: 'tn-data', label: '§03 Wind and oscillation data' }],
    responseKey: 'response',
    rows: 8,
    large: true,
    submitLabel: 'Submit',
  },
  {
    id: 'act-4',
    title: 'Design analysis',
    thinkingMove: 'Diagnose',
    prompt: 'Explain the physical consequences of replacing the 7.6m open-lattice trusses with 2.4m solid plate girders, and trace how this one decision created the aerodynamic conditions that led to collapse.',
    sentenceStarters: [
      'Replacing the open-lattice trusses with solid plate girders increased aerodynamic drag because…',
      'This design change affected the bridge\'s behaviour by… which made it vulnerable to…',
    ],
    conceptLinks: [
      { id: 'torsion', title: 'Torsional oscillation' },
      { id: 'flutter', title: 'Aeroelastic flutter' },
    ],
    evidenceSections: [
      { id: 'tn-specifications', label: '§02 Bridge specifications' },
      { id: 'tn-design',         label: '§04 Engineering sign-off' },
    ],
    responseKey: 'response',
    rows: 8,
    large: true,
    submitLabel: 'Submit',
  },
  {
    id: 'act-5',
    title: 'Expert evaluation',
    thinkingMove: 'Evaluate',
    prompt: 'Evaluate the statements of Dr. Brandt and Dr. Osei-Mensah: one is correct, and one relies on a claim the data directly contradicts. Identify which account is better supported by the evidence, and name the specific claim that undermines the weaker argument.',
    sentenceStarters: [
      'Dr. [X]\'s account is better supported by the evidence because…',
      'The specific claim in Dr. [X]\'s statement that is directly contradicted by the data is…',
    ],
    conceptLinks: [
      { id: 'resonance',       title: 'Resonance' },
      { id: 'vortex-shedding', title: 'Vortex shedding' },
      { id: 'flutter',         title: 'Aeroelastic flutter' },
      { id: 'damping',         title: 'Damping' },
    ],
    evidenceSections: [
      { id: 'tn-data',    label: '§03 Wind and oscillation data' },
      { id: 'tn-experts', label: '§05 Expert witness statements' },
    ],
    responseKey: 'response',
    rows: 8,
    large: true,
    submitLabel: 'Submit',
  },
  {
    id: 'act-6',
    title: 'Tribunal report',
    thinkingMove: 'Synthesise',
    prompt: 'Bring your full analysis together into a structured, roughly 200-word report for the inquiry tribunal. The three things it must address are set out below.',
    // Synthesises everything else — submitting before the earlier analysis
    // exists would just produce an unsupported report.
    requiresActivities: ['act-1', 'act-2', 'act-3', 'act-4', 'act-5'],
    sentenceStarters: [
      'The Tacoma Narrows Bridge failed due to… not… because the data shows…',
      'The engineers\' model was incomplete in that it failed to account for…',
      'To prevent a recurrence, the bridge should have been designed to… because…',
    ],
    responseKey: 'report',
    inputLabel: 'Tribunal Report, Case 1940-TN-001',
    rows: 10,
    large: true,
    submitLabel: 'Submit',
    danger: true,
    extraInstruction: {
      lead: 'You have examined all the evidence in this case file. Now write your report for the inquiry tribunal. Your report should be approximately 200 words and must address three things:',
      items: [
        'What was the actual mechanism of failure? (Not what was assumed, but what the evidence shows.)',
        "Where was the engineers' model incomplete? What did it fail to account for?",
        'What single design change would you recommend to prevent a recurrence?',
      ],
    },
  },
]

export function getActivityStatus(activityId, responses) {
  const val = responses[activityId]
  if (val == null) return 'not-started'
  if (val._submitted) return 'complete'
  const key = activities.find(a => a.id === activityId)?.responseKey
  return val[key]?.trim() ? 'inprogress' : 'not-started'
}

export function getResponseExcerpt(activityId, responses) {
  const val = responses[activityId]
  if (!val) return null
  const key = activities.find(a => a.id === activityId)?.responseKey
  const text = val[key]
  return typeof text === 'string' && text.trim() ? text.trim() : null
}
