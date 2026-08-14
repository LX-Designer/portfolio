// Physics Toolkit for the Tacoma Narrows inquiry lab. Each object is passed
// to ConceptCard.jsx as the `concept` prop; the shell only reads id/title.
export const toolkitConcepts = [

  {
    id: 'oscillation',
    title: 'Oscillation and natural frequency',
    tagline: 'Every structure has a characteristic rate at which it naturally vibrates.',
    intro: 'Oscillation is any repetitive back-and-forth motion around a resting position. Every physical object (a guitar string, a pendulum, a bridge deck) has a natural frequency: the rate at which it will oscillate when disturbed, determined by its mass and stiffness. Natural frequency is measured in hertz (Hz), meaning cycles per second.',
    sections: [
      { heading: 'Frequency and period', body: 'Frequency is how many complete oscillation cycles occur per second, measured in hertz (Hz). Period is the time taken for one complete cycle, measured in seconds. They are reciprocals of each other: a bridge oscillating at 0.5 Hz completes one full cycle every 2 seconds. A higher natural frequency means a stiffer or lighter structure; a lower natural frequency means a more flexible or heavier one.' },
      { heading: 'Natural frequency', body: 'Natural frequency is set by a structure\'s physical properties, primarily its mass and its stiffness. A stiffer structure has a higher natural frequency; a more massive or more flexible one has a lower natural frequency. Every distinct mode of oscillation (vertical, lateral, torsional) has its own natural frequency. Changing the structural design, whether materials, geometry, or depth, changes the natural frequencies.' },
      { heading: 'Why it matters for structures', body: 'Engineers measure the natural frequencies of a structure during design and testing because these values determine how the structure will respond to external forces. A structure oscillating near its natural frequency is more vulnerable to energy build-up than one being forced at a very different frequency. Knowing the natural frequencies of a bridge allows engineers to assess whether wind, traffic, or other periodic loads could become dangerous.' },
    ],
    keyTerms: [
      { term: 'Oscillation', definition: 'Repetitive back-and-forth motion around a resting position.' },
      { term: 'Frequency', definition: 'The number of complete oscillation cycles per second. Unit: hertz (Hz).' },
      { term: 'Period', definition: 'The time for one complete oscillation cycle. Equal to 1 ÷ frequency.' },
      { term: 'Natural frequency', definition: 'The rate at which a structure or system oscillates when disturbed, determined by its mass and stiffness.' },
      { term: 'Hertz (Hz)', definition: '1 Hz = 1 cycle per second.' },
    ],
    diagram: '/tacoma-narrows/toolkit/oscillation.svg',
    diagramAlt: 'Diagram of a sine wave showing one complete oscillation cycle, with amplitude and period labelled.',
    applyTo: 'Use this concept when reading the frequency data in §03, specifically when interpreting what the measured frequency values mean and what they tell you about the bridge\'s structural behaviour on the day of the collapse.',
  },

  {
    id: 'resonance',
    title: 'Resonance',
    tagline: 'When a force drives a system at its natural frequency, energy accumulates and amplitude grows.',
    intro: 'Resonance is a specific physical condition, not a general one. It occurs when an external periodic force acts on a structure at the same frequency at which the structure naturally oscillates. When this condition is met, each push from the external force arrives at the right moment to reinforce the existing motion, energy accumulates in the system, and amplitude grows, potentially to destructive levels.',
    sections: [
      { heading: 'The resonance condition', body: 'For resonance to occur, two frequencies must match: the forcing frequency (the rate at which an external force is applied) and the natural frequency of the system being driven. When they match, each push from the external force adds energy to the motion. When they do not match, the pushes arrive out of phase, sometimes reinforcing, sometimes opposing, and no sustained energy build-up occurs. The closer the match, the stronger the resonant response.' },
      { heading: 'How close is close enough?', body: 'Resonance does not require a perfect frequency match, but it does require a reasonably close one. The amplitude response of a system peaks sharply at its natural frequency and falls off on either side. A forcing frequency that differs from the natural frequency by a factor of two or more produces negligible resonant amplification. A 5× difference (for example, a forcing frequency five times larger than the natural frequency) would be far outside the resonance band and could not explain sustained amplitude growth.' },
      { heading: 'What resonance looks like in data', body: 'If a bridge is collapsing due to resonance, you would expect to see: a forcing frequency that is close to the natural frequency of the oscillation mode that failed; amplitude growing steadily over time; and failure occurring after sufficient energy has accumulated. If the frequencies are substantially different, resonance alone cannot explain the amplitude growth; another mechanism must be responsible.' },
    ],
    keyTerms: [
      { term: 'Resonance', definition: 'The condition in which a forcing frequency matches the natural frequency of a system, causing amplitude to grow with each successive push.' },
      { term: 'Forcing frequency', definition: 'The rate at which an external periodic force is applied to a structure.' },
      { term: 'Natural frequency', definition: 'The rate at which a structure oscillates when disturbed. Must match the forcing frequency for resonance to occur.' },
      { term: 'Amplitude', definition: 'The size of an oscillation: the maximum displacement from the resting position.' },
      { term: 'Resonance band', definition: 'The range of forcing frequencies close enough to the natural frequency to produce significant resonant amplification.' },
    ],
    diagram: '/tacoma-narrows/toolkit/resonance-curve.svg',
    diagramAlt: 'Graph showing amplitude of oscillation on the vertical axis and driving frequency on the horizontal axis. A sharp peak occurs where the driving frequency equals the natural frequency, with amplitude falling steeply on either side.',
    applyTo: 'Use this concept when evaluating the frequency data in §03 and when assessing the expert witness accounts in §05. The resonance explanation makes a specific, testable prediction about frequency, and the case file contains the data to test it.',
  },

  {
    id: 'vortex-shedding',
    title: 'Vortex shedding',
    tagline: 'Wind flowing past a blunt structure generates alternating vortices that create a periodic force.',
    intro: 'When wind flows past a streamlined shape, like an aircraft wing, it follows the surface smoothly. When it flows past a blunt shape, like a rectangular beam, it cannot follow the surface around the edges and instead separates, forming spinning regions of air called vortices. These vortices shed alternately from each side, creating a repeating pressure pattern that pushes and pulls on the structure at a predictable frequency.',
    sections: [
      { heading: 'How vortices form and shed', body: 'As wind flows past a blunt cross-section, it separates from the surface at the edges. On one side, a vortex grows until it becomes large enough to break away: it "sheds." As it does, a new vortex begins forming on the other side. This alternating shedding creates an oscillating sideways force on the structure. The structure experiences pushes alternately from above and below (or from each side, depending on its orientation).' },
      { heading: 'Vortex shedding frequency', body: 'The frequency at which vortices shed depends on the wind speed and the width of the cross-section. The relationship is described by the Strouhal number: for blunt rectangular sections, the shedding frequency is approximately 0.2 × (wind speed ÷ cross-section width). At a given wind speed, a narrow section sheds vortices more quickly than a wide one. This means the shedding frequency can be calculated from known values and compared against measured frequencies.' },
      { heading: 'Vortex shedding as a forcing mechanism', body: 'Vortex shedding produces a periodic force on the structure: a forcing function. If the shedding frequency happens to match the natural frequency of the structure, resonance can occur. If not, the periodic force still exists, but it does not cause sustained energy build-up. Understanding vortex shedding is therefore essential for evaluating any resonance explanation: the vortex shedding frequency is the external forcing frequency that would need to match the natural frequency for resonance to occur.' },
    ],
    keyTerms: [
      { term: 'Vortex', definition: 'A spinning region of fluid (air or water) that forms when flow separates from a surface.' },
      { term: 'Vortex shedding', definition: 'The alternating detachment of vortices from opposite sides of a blunt structure in a flow, creating a periodic force.' },
      { term: 'Strouhal number', definition: 'A dimensionless number relating vortex shedding frequency to wind speed and cross-section width. For blunt rectangular sections, approximately 0.2.' },
      { term: 'Forcing frequency', definition: 'The rate at which vortex shedding applies an oscillating force to the structure.' },
      { term: 'Blunt body', definition: 'A cross-section that causes flow separation (e.g. a rectangle or flat plate), as opposed to a streamlined shape that allows smooth flow.' },
    ],
    diagram: '/tacoma-narrows/toolkit/vortex-shedding.svg',
    diagramAlt: 'Diagram showing wind flowing from left to right past a rectangular cross-section, with alternating vortices forming and shedding from the top and bottom edges.',
    applyTo: 'Use this concept when interpreting the vortex shedding frequency value in §03. It explains what generates the periodic forcing function that the resonance explanation relies on, and allows you to evaluate whether that forcing frequency is consistent with the data.',
  },

  {
    id: 'damping',
    title: 'Damping',
    tagline: 'Damping determines whether oscillations die out, persist, or grow over time.',
    intro: 'Damping describes how energy is lost from, or fed into, an oscillating system over time. In a well-damped structure, oscillations naturally decay: each cycle is slightly smaller than the last because energy is being dissipated. In a negatively-damped system, the opposite occurs: energy is added to the oscillation with each cycle, and amplitude grows. Negative damping is the condition that makes oscillations destructive.',
    sections: [
      { heading: 'Positive damping', body: 'Most real structures exhibit positive damping. Every time the structure oscillates, some energy is lost to friction, air resistance, or internal material deformation. This means each successive oscillation is slightly smaller than the previous one. Given enough time without external forcing, a positively-damped structure will stop oscillating entirely. Structural engineers design for positive damping: the greater the damping, the quicker dangerous oscillations die out.' },
      { heading: 'Negative damping', body: 'Negative damping occurs when the forces acting on a structure add energy to the oscillation rather than removing it. Instead of each cycle being smaller than the last, each cycle is larger. The oscillation grows without bound until something fails. Negative damping is not caused by an external force driving the structure; it is a property of the interaction between the structure\'s motion and the forces that motion generates. The energy source is external (e.g. wind), but the structure\'s own movement determines how that energy is applied.' },
      { heading: 'Why the distinction matters', body: 'In resonance, an external periodic force drives a positively-damped structure. The amplitude grows when the forcing is close to the natural frequency, but if the forcing is removed, oscillations will eventually decay. In negative damping, no external periodic force is required: the structure generates its own driving force through its motion. Removing the energy source (e.g. wind dropping) would stop the oscillation, but matching or mismatching the frequency would not.' },
    ],
    keyTerms: [
      { term: 'Damping', definition: 'The process by which energy is lost from an oscillating system, causing amplitude to decrease over time.' },
      { term: 'Positive damping', definition: 'Normal damping: energy is dissipated each cycle, and oscillations decay over time.' },
      { term: 'Negative damping', definition: 'Energy is added to the oscillation each cycle, causing amplitude to grow over time. Leads to structural failure if unchecked.' },
      { term: 'Damping ratio', definition: 'A measure of how quickly oscillations decay in a positively-damped system. A higher ratio means faster decay.' },
    ],
    diagram: '/tacoma-narrows/toolkit/damping.svg',
    diagramAlt: 'Three side-by-side graphs showing oscillation amplitude over time. Left: positive damping, amplitude decreases each cycle. Centre: zero damping, constant amplitude. Right: negative damping, amplitude grows each cycle.',
    applyTo: 'Use this concept when analysing how the bridge\'s oscillation behaviour changed over the course of the day, specifically the shift from the morning phase to the collapse phase. Ask whether the observed amplitude change is consistent with positive damping, zero damping, or negative damping.',
  },

  {
    id: 'torsion',
    title: 'Torsional oscillation',
    tagline: 'A bridge can oscillate in different modes: vertical bending and torsional twisting behave differently and have different natural frequencies.',
    intro: 'A long flexible structure like a suspension bridge can oscillate in several distinct modes. The most intuitive is vertical bending: the deck moves up and down. A second mode is torsional oscillation, in which the deck twists along its length: one side rises while the other falls. These modes are physically distinct, have different natural frequencies, and may require different explanations.',
    sections: [
      { heading: 'Bending versus torsional modes', body: 'In a bending (vertical) oscillation, both sides of the deck move up and down together: the whole cross-section translates vertically. In a torsional oscillation, the deck rotates about its long axis: one edge moves up while the other moves down, and the cross-section twists. A structure\'s resistance to torsional oscillation depends largely on the torsional stiffness of its cross-section; a deep, wide section is generally more torsionally stiff than a shallow, narrow one.' },
      { heading: 'Separate natural frequencies', body: 'Because they involve different physical motions, bending and torsional modes have different natural frequencies. A bridge may oscillate vertically at one frequency and, if disturbed into torsion, oscillate torsionally at a different frequency. If the two values are very different, the modes are said to be well-separated: a force driving one mode will have little effect on the other. If the frequencies are close together, the modes can couple, with energy transferring between them.' },
      { heading: 'Torsional stiffness and design', body: 'A bridge deck\'s resistance to twisting depends heavily on its cross-section. A solid, deep cross-section resists torsion far better than a shallow, open one. Open-lattice trusses provide torsional stiffness through their triangulated structure; a solid flat plate girder of the same overall depth provides less torsional stiffness because it can more easily be twisted. The depth of the stiffening girder beneath the road deck is therefore directly related to the bridge\'s vulnerability to torsional oscillation.' },
    ],
    keyTerms: [
      { term: 'Torsion', definition: 'A twisting force or motion: rotation of a structure about its long axis.' },
      { term: 'Torsional oscillation', definition: 'An oscillation mode in which the bridge deck twists: one side rises while the other falls.' },
      { term: 'Bending mode', definition: 'An oscillation mode in which the deck moves vertically as a whole, the most intuitive bridge oscillation.' },
      { term: 'Torsional stiffness', definition: 'A structure\'s resistance to twisting. Determined by cross-section geometry and material.' },
      { term: 'Mode coupling', definition: 'When two oscillation modes (e.g. bending and torsional) interact because their natural frequencies are close together.' },
    ],
    diagram: '/tacoma-narrows/toolkit/torsion.svg',
    diagramAlt: 'Two cross-section diagrams of a bridge deck. Left shows bending mode: the whole deck moves up and down uniformly. Right shows torsional mode: the deck rotates, with one side up and the other down.',
    applyTo: 'Use this concept when interpreting the two phases of bridge behaviour in §03, specifically to understand the significance of the transition from vertical to torsional oscillation, and what it means for the type of explanation required.',
  },

  {
    id: 'flutter',
    title: 'Aeroelastic flutter',
    tagline: 'Flutter occurs when a structure\'s own motion generates aerodynamic forces that amplify the motion further.',
    intro: 'Aeroelastic flutter is a self-reinforcing instability that occurs when a flexible structure in an airflow moves in a way that changes the aerodynamic forces acting on it, and those changed forces amplify the motion rather than opposing it. Unlike resonance, flutter does not require an external force to match the structure\'s natural frequency. The structure itself, through its motion, becomes the source of the forces that destroy it.',
    sections: [
      { heading: 'How flutter differs from resonance', body: 'In resonance, an external force drives the structure at its natural frequency. Remove the forcing function and the oscillation eventually decays. In flutter, no external periodic forcing is required. The structure\'s own motion changes its aerodynamic environment, which generates forces that act in the same direction as the motion, amplifying it further. The wind supplies energy; the structure\'s motion determines how that energy is applied. This distinction has an important testable consequence: flutter does not require a frequency match between the wind\'s forcing function and the structure\'s natural frequency.' },
      { heading: 'The role of the cross-section shape', body: 'Flutter typically involves structures whose cross-sections behave aerodynamically: that is, they generate lift and drag forces that change when the cross-section tilts relative to the airflow. An aerofoil (aircraft wing) is the classic example: at a small positive angle of attack, it generates upward lift; as the angle increases, lift increases. A solid flat plate in an airflow behaves similarly. When such a cross-section begins to twist, its angle relative to the wind changes, which changes the lift force, and if this change acts to increase the twist rather than reduce it, the system enters a flutter condition.' },
      { heading: 'Negative damping and the flutter threshold', body: 'Flutter is a form of negative damping. Each oscillation cycle adds energy to the motion rather than removing it, so amplitude grows. This continues until the structure fails or the wind speed drops below the critical flutter speed. The critical flutter speed depends on the structure\'s mass, stiffness, and cross-section shape. A structure with a shallow, aerodynamically active cross-section will typically have a lower critical flutter speed, meaning flutter can occur at lower wind speeds, than one with a deep, open cross-section that allows wind to pass through rather than around it.' },
    ],
    keyTerms: [
      { term: 'Aeroelastic flutter', definition: 'A self-reinforcing structural instability in which a structure\'s own motion generates aerodynamic forces that amplify the motion further.' },
      { term: 'Negative damping', definition: 'The condition in which each oscillation cycle adds energy to the motion, causing amplitude to grow.' },
      { term: 'Angle of attack', definition: 'The angle between a cross-section (e.g. a bridge deck or wing) and the direction of the oncoming airflow.' },
      { term: 'Critical flutter speed', definition: 'The minimum wind speed at which a given structure will enter a flutter condition. Depends on structural and aerodynamic properties.' },
      { term: 'Aeroelastic instability', definition: 'Any condition in which aerodynamic forces and structural flexibility interact to produce unstable, growing, motion.' },
    ],
    diagram: '/tacoma-narrows/toolkit/flutter-aerofoil.svg',
    diagramAlt: 'Diagram showing a cross-section of a flat plate at two different angles of attack, with arrows indicating the direction of the resulting lift force in each case. At increased angle of attack, the lift force acts in the same direction as the twist.',
    applyTo: 'Use this concept when evaluating the expert witness statements in §05, and when constructing your tribunal report. Apply it to the collapse-phase data in §03, specifically the torsional oscillation at 0.2 Hz, and consider what it predicts about the relationship between the forcing frequency and the failure mode.',
  },

]
