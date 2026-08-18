import s from './index.module.css'
import FileSection from './FileSection.jsx'

const bridgePhoto      = '/tacoma-narrows/tacoma-narrow-bridge.jpg'
const collapseVideo    = '/videos/The_collapse_of_the_Tacoma_Bridge.mp4'
const girderDiagram     = '/tacoma-narrows/girder-comparison.svg'
const frequencyDiagram  = '/tacoma-narrows/frequency-diagram.svg'
const flutterDiagram    = '/tacoma-narrows/flutter-feedback.svg'

export default function CaseDocument({ responses, openSections, onToggleSection, allOpen, onOpenAll, instantExpand }) {
  const isOpen = (id) => openSections.has(id)
  const toggle = (id) => () => onToggleSection(id)

  return (
    <>
      <header className={s.docHeader}>
        <div className={s.coverCard}>
          <div className={s.docClassification}>Official Record · Inquiry Tribunal · Restricted Distribution</div>
          <h1 className={s.docTitle}>The Bridge That Shouldn't Have Failed</h1>
          <p className={s.docSubtitle}>Engineering Incident Report: Tacoma Narrows Bridge, 1940</p>

          <div className={s.coverInset}>
            <div className={s.coverFields}>
              <div className={s.coverField}>
                <span className={s.coverFieldLabel}>Incident date</span>
                <span className={s.coverFieldDots} />
                <span className={s.coverFieldValue}>07 November 1940</span>
              </div>
              <div className={s.coverField}>
                <span className={s.coverFieldLabel}>Location</span>
                <span className={s.coverFieldDots} />
                <span className={s.coverFieldValue}>Tacoma Narrows, Washington State</span>
              </div>
              <div className={s.coverField}>
                <span className={s.coverFieldLabel}>Classification</span>
                <span className={s.coverFieldDots} />
                <span className={s.coverFieldValue}>Structural Collapse: Total Loss</span>
              </div>
              <div className={s.coverField}>
                <span className={s.coverFieldLabel}>File reference</span>
                <span className={s.coverFieldDots} />
                <span className={s.coverFieldValue}>1940-TN-001</span>
              </div>
            </div>

            <div className={s.coverChecklist}>
              <div className={s.coverChecklistTitle}>This file is</div>
              <div className={s.coverChecklistItem}>
                <span className={`${s.coverCheckbox} ${s.coverCheckboxChecked}`}>✓</span>
                Official tribunal record
              </div>
              <div className={s.coverChecklistItem}>
                <span className={`${s.coverCheckbox} ${s.coverCheckboxChecked}`}>✓</span>
                Restricted distribution
              </div>
              <div className={s.coverChecklistItem}>
                <span className={s.coverCheckbox} />
                Declassified
              </div>
            </div>

            <details className={s.beforeDetails}>
              <summary className={s.beforeSummary}>ⓘ Before you begin: assumptions and learning goals</summary>
              <div className={s.beforeContent}>
                <div className={s.beforeGroup}>
                  <span className={s.beforeGroupTitle}>These physics concepts underpin this investigation</span>
                  <ul className={s.beforeList}>
                    <li>Oscillation and frequency (Hz)</li>
                    <li>Basic concept of resonance</li>
                    <li>Newton's laws of motion</li>
                    <li>Concept of damping</li>
                    <li>Reading and interpreting data tables</li>
                    <li>Basic structural forces: tension and compression</li>
                  </ul>
                </div>
                <div className={s.beforeGroup}>
                  <span className={s.beforeGroupTitle}>You will apply these concepts to</span>
                  <ul className={s.beforeList}>
                    <li>Evaluate competing physical explanations for structural failure using primary evidence</li>
                    <li>Use frequency data to evaluate competing physical explanations</li>
                    <li>Identify limitations in an engineering model</li>
                    <li>Analyse how a design decision changes structural behaviour</li>
                    <li>Evaluate expert claims against primary source evidence</li>
                    <li>Construct an evidence-based argument in a formal written format</li>
                  </ul>
                </div>
              </div>
            </details>

            <button
              className={`${s.openFileBtn} ${allOpen ? s.openFileBtnOpen : ''}`}
              onClick={onOpenAll}
              aria-expanded={allOpen}
            >
              {allOpen ? 'Close Case File' : 'Open Case File →'}
            </button>
          </div>
        </div>
      </header>

      <div className={`${s.contentWrap} ${instantExpand ? s.contentWrapInstant : ''}`}>

        <FileSection id="tn-overview" code="§ 01" title="Incident Overview" italic isOpen={isOpen('tn-overview')} onToggle={toggle('tn-overview')}>
          <p>At 11:10 a.m. on the morning of 7 November 1940, approximately 600 feet of the central span of the Tacoma Narrows Bridge broke free from its suspender cables and fell 190 feet into the cold waters of Puget Sound below. The bridge had been open to traffic for exactly 128 days.</p>

          <p>The wind speed recorded at midspan was 42 miles per hour, a moderate autumn storm by the standards of the Pacific Northwest. The bridge had been designed to withstand static wind loads far in excess of this figure. On paper, the structure should have been safe.</p>

          <p>The collapse was filmed by University of Washington engineer F.B. Farquharson, who had been stationed at the bridge as part of an ongoing investigation into its unusual behaviour. His footage, still widely circulated today, shows the bridge twisting violently along its length, one side of the roadway rising while the other falls, before sections of the deck tear themselves apart.</p>

          <figure className={s.diagram}>
            <video src={collapseVideo} poster={bridgePhoto} controls playsInline preload="metadata">
              Your browser doesn't support this video format.
            </video>
            <figcaption className={s.diagramCaption}>Footage of the Tacoma Narrows Bridge collapsing, 7 November 1940. Public domain.</figcaption>
          </figure>

          <p>The collapse has shocked the engineering world. Tacoma Narrows was not an experimental structure; it had been reviewed by eminent engineers and approved by federal funding authorities. It was the third-longest suspension bridge in the world. Its collapse represents not merely a structural failure, but a failure of the profession's models and assumptions.</p>
        </FileSection>

        <FileSection id="tn-specifications" code="§ 02" title="Bridge Specifications" isOpen={isOpen('tn-specifications')} onToggle={toggle('tn-specifications')}>
          <p>The following technical specifications are drawn from the original engineering records submitted to the Federal Works Agency prior to construction. These figures were publicly available and were reviewed by the engineering board at approval.</p>

          <div className={s.dataTableWrap}>
            <table className={s.dataTable}>
              <thead><tr><th>Parameter</th><th>Value</th><th>Notes</th></tr></thead>
              <tbody>
                <tr><td>Total bridge length</td><td>1,810 m</td><td>Including approach spans</td></tr>
                <tr className={s.highlightRow}><td>Main span length</td><td>853 m</td><td>Third longest in world at time of construction</td></tr>
                <tr className={s.highlightRow}><td>Deck width</td><td>12 m</td><td>Two lanes only: unusually narrow for span length</td></tr>
                <tr><td>Span-to-width ratio</td><td>72 : 1</td><td>Compare Golden Gate: ~47:1</td></tr>
                <tr className={s.highlightRow}><td>Stiffening girder depth</td><td>2.4 m (solid plate)</td><td>Original design called for 7.6 m open trusses</td></tr>
                <tr><td>Tower height</td><td>130 m</td><td>Above water level</td></tr>
                <tr><td>Dead load (self-weight)</td><td>~7,000 kN/m</td><td>Significantly lighter than conventional designs</td></tr>
                <tr><td>Design static wind load</td><td>Rated to 100+ mph</td><td>Static force calculation; dynamic behaviour not modelled</td></tr>
                <tr><td>Construction cost</td><td>$6.4 million USD</td><td>Approximately 40% less than original conservative estimate</td></tr>
              </tbody>
            </table>
          </div>

          <figure className={s.diagram}>
            <img src={girderDiagram} alt="Cross-section comparison: open-lattice truss (original design, 7.6 m deep) versus solid plate girder (as built, 2.4 m deep), with wind flow shown in each case." />
          </figure>

          <div className={s.callout}>
            <span className={s.calloutLabel}>Design note</span>
            The original Washington State design, prepared by engineer Clark Eldridge, specified 7.6-metre open-lattice trusses beneath the roadway. This design was overruled by federal funding authorities, who engaged New York engineer Leon Moisseiff to produce a less expensive alternative. Moisseiff's design used 2.4-metre solid plate girders: elegant, slender, and, as Moisseiff described it, "the most beautiful bridge in the world."
          </div>
        </FileSection>

        <FileSection id="tn-data" code="§ 03" title="Wind and Oscillation Data" isOpen={isOpen('tn-data')} onToggle={toggle('tn-data')}>
          <p>The following data was recorded by instruments and observers on the day of the collapse, and reconstructed from film footage and engineering records in the weeks following. All times are Pacific Standard Time.</p>

          <div className={s.dataTableWrap}>
            <table className={s.dataTable}>
              <thead><tr><th>Time</th><th>Wind speed</th><th>Oscillation type</th><th>Frequency</th><th>Amplitude</th></tr></thead>
              <tbody>
                <tr><td>~07:00</td><td>35 mph (56 km/h)</td><td>Vertical (transverse)</td><td>~0.6 Hz</td><td>~0.5 m</td></tr>
                <tr><td>~08:30</td><td>38 mph (61 km/h)</td><td>Vertical (transverse)</td><td>~0.6 Hz</td><td>~1.2 m</td></tr>
                <tr><td>~10:00</td><td>42 mph (68 km/h)</td><td>Mixed: transition</td><td>Irregular</td><td>Increasing</td></tr>
                <tr className={s.highlightRow}><td>~10:15</td><td>42 mph (68 km/h)</td><td>Torsional (twisting)</td><td>0.2 Hz</td><td>~4 m, growing</td></tr>
                <tr className={s.highlightRow}><td>~10:45</td><td>42 mph (68 km/h)</td><td>Torsional (twisting)</td><td>0.2 Hz</td><td>~8.5 m (deck at 45°)</td></tr>
                <tr><td>11:02</td><td>42 mph (68 km/h)</td><td>Collapse initiating</td><td>N/A</td><td>Cable failure begins</td></tr>
                <tr><td>11:10</td><td>42 mph (68 km/h)</td><td>N/A</td><td>N/A</td><td>Central span collapses</td></tr>
              </tbody>
            </table>
          </div>

          <p>Additional instrument data recovered from the site after the collapse:</p>

          <div className={s.dataTableWrap}>
            <table className={s.dataTable}>
              <thead><tr><th>Measurement</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Estimated natural vertical frequency of bridge</td><td>~0.6 Hz (matches early oscillation data)</td></tr>
                <tr className={s.highlightRow}><td>Calculated vortex shedding frequency at 42 mph wind</td><td>~1.0 Hz</td></tr>
                <tr className={s.highlightRow}><td>Observed torsional oscillation frequency at collapse</td><td>0.2 Hz</td></tr>
                <tr><td>Trigger event at ~10:00</td><td>A midspan stay cable slipped, creating asymmetric loading</td></tr>
              </tbody>
            </table>
          </div>

          <figure className={s.diagram}>
            <img src={frequencyDiagram} alt="Frequency diagram showing three values on a horizontal axis: torsional oscillation at collapse (0.2 Hz), natural vertical frequency (0.6 Hz), and vortex shedding frequency at 42 mph wind (1.0 Hz)." />
          </figure>
        </FileSection>

        <FileSection id="tn-design" code="§ 04" title="Original Engineering Sign-Off" isOpen={isOpen('tn-design')} onToggle={toggle('tn-design')}>
          <p>The following is an excerpt from the structural engineering assessment prepared by Moisseiff's team, submitted to the Federal Works Agency on 12 April 1938 in support of the design proposal. This document was approved by the reviewing board.</p>

          <div className={s.witnessBlock}>
            <div className={s.witnessTag}>Exhibit A: Engineering Assessment (excerpt)</div>
            <div className={s.witnessName}>Moisseiff &amp; Lienhard, Consulting Engineers</div>
            <div className={s.witnessRole}>Structural assessment, April 1938</div>
            <div className={s.witnessText}>
              <p>"The proposed structure has been analysed using the deflection theory, which accounts for the contribution of the main cables in resisting lateral wind loads. Under this method, the stiffness provided by the cable system, acting through the suspenders, absorbs approximately one-half of any applied static wind pressure, transmitting the remainder to the anchorages and towers.</p>
              <p>The proposed plate girder section, at 8 feet in depth, provides adequate stiffness for all anticipated design loads. The structure has been found to be safe under wind forces equivalent to a uniform static pressure of 30 lb/ft² applied to the exposed surface area, corresponding to wind velocities well in excess of any recorded at the Narrows.</p>
              <p>We are satisfied that the proposed design meets or exceeds all applicable safety standards and that no further analysis is required prior to construction approval."</p>
            </div>
          </div>

          <div className={s.callout}>
            <span className={s.calloutLabel}>Tribunal context</span>
            The assessment above is technically accurate within its stated assumptions; it correctly applies the deflection theory for static wind loads.
          </div>
        </FileSection>

        <FileSection id="tn-experts" code="§ 05" title="Expert Witness Statements" isOpen={isOpen('tn-experts')} onToggle={toggle('tn-experts')}>
          <p>Two expert witnesses submitted statements to the tribunal. They were given the same incident data. Their conclusions differ substantially.</p>

          <div className={s.witnessBlock}>
            <div className={s.witnessTag}>Expert Witness A</div>
            <div className={s.witnessName}>Dr. Heinrich Brandt</div>
            <div className={s.witnessRole}>Professor of Structural Mechanics, Institute of Technology</div>
            <div className={s.witnessText}>
              <p>"The collapse of the Tacoma Narrows Bridge is, at its core, a classic case of mechanical resonance. Wind flowing past the bridge generated alternating pressure vortices at a frequency that, in the conditions recorded on 7 November 1940, was close to the bridge's natural frequency. The vertical oscillations observed in the morning hours are consistent with resonant energy build-up. The subsequent torsional motion was a consequence of this resonant excitation reaching the torsional mode of the structure. The fundamental cause remains resonance throughout. The engineers simply did not account for the dynamic loading imposed by wind-induced resonance."</p>
            </div>
          </div>

          <div className={s.witnessBlock}>
            <div className={s.witnessTag}>Expert Witness B</div>
            <div className={s.witnessName}>Dr. Amara Osei-Mensah</div>
            <div className={s.witnessRole}>Specialist in Aeroelastic Systems, National Research Laboratory</div>
            <div className={s.witnessText}>
              <p>"With respect to my colleague, the resonance explanation is demonstrably incomplete, and the data in this case file is sufficient to show why. The torsional mode of the Tacoma Narrows Bridge oscillated at 0.2 Hz at the time of collapse. The calculated vortex shedding frequency at 42 mph wind speed is approximately 1.0 Hz. These figures are not equal. The resonance model cannot explain the torsional collapse.</p>
              <p>What actually occurred is a phenomenon called aeroelastic flutter. The collapse-phase motion was triggered by an asymmetric loading condition: a midspan stay cable that slipped at approximately 10:00. Once torsional oscillation began, the aerodynamic properties of the solid plate girder produced forces that amplified rather than opposed the motion. The structure's own movement, not an external periodic force, drove the collapse."</p>
            </div>
          </div>

          <figure className={s.diagram}>
            <img src={flutterDiagram} alt="Diagram of the aeroelastic flutter feedback loop: twist changes aerodynamic force, which amplifies the twist" />
            <figcaption className={s.diagramCaption}>The aeroelastic flutter feedback loop described by Dr. Osei-Mensah. Unlike resonance, flutter is self-sustaining: the structure's own motion generates the forces that destroy it.</figcaption>
          </figure>
        </FileSection>

        <FileSection id="tn-investigation" code="§ 06" title="Post-Collapse Investigation" isOpen={isOpen('tn-investigation')} onToggle={toggle('tn-investigation')}>
          {!responses['act-6'] ? (
            <div className={s.callout}>
              <span className={s.calloutLabel}>Restricted</span>
              <p>Post-collapse investigation findings are restricted until you have submitted your tribunal report. The inquiry tribunal's process requires that you reach your own determination before examining the historical record.</p>
              <p style={{ marginTop: '10px', opacity: 0.7 }}>Complete Activity 6 to unlock this section.</p>
            </div>
          ) : (
            <>
              <p>In March 1941, the Carmody Board, a panel of senior engineers convened by the Federal Works Agency, published its findings. Three conclusions stood out:</p>

              <p><strong>1.</strong> The principal cause of failure was the bridge's extreme flexibility, resulting from its shallow and narrow design.</p>
              <p><strong>2.</strong> The solid plate girder and deck section acted aerodynamically, generating lift and drag forces that the original model had not accounted for.</p>
              <p><strong>3.</strong> Aerodynamic forces on large flexible structures were poorly understood. Wind tunnel testing of dynamic models should be required for all future long-span bridge designs.</p>

              <div className={s.callout}>
                <span className={s.calloutLabel}>Historical note</span>
                The Carmody Board declined to assign individual blame. Leon Moisseiff, whose career was effectively ended by the collapse, was exonerated. The board concluded that the entire engineering profession had operated at the limits of available knowledge. The science of aeroelasticity, as applied to large structures, was born in the aftermath of this failure. The replacement bridge, opened in 1950, was built with open-lattice trusses and has stood without incident ever since.
              </div>

              <p>It later emerged that the PWA field engineer, David L. Glenn, had formally objected to the design and refused to sign off on the bridge before opening. He was overruled by federal officials. He was dismissed from his post approximately two weeks later.</p>
            </>
          )}
        </FileSection>

      </div>
    </>
  )
}
