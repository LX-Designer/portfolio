import s from './index.module.css'

// First-visit briefing — no backdrop/escape dismissal, since this is meant
// to read as a mission briefing the analyst has to acknowledge before the
// case file opens, not a skippable dialog.
export default function WelcomeModal({ onBegin }) {
  return (
    <div className={`${s.tnModal} ${s.visible}`}>
      <div className={s.briefingBox}>
        <div className={s.briefingHeader}>
          <div className={s.briefingEyebrow}>Inquiry Tribunal · Case 1940-TN-001</div>
          <h2 className={s.briefingTitle}>Your Assignment</h2>
        </div>

        <div className={s.briefingBody}>
          <p className={s.briefingText}>
            In 1940, the Tacoma Narrows bridge in Pierce County, Washington collapsed. You are a
            junior analyst assigned to the post-collapse inquiry tribunal. Your task is to work
            through the inquiry activities, examine the data, evaluate competing expert claims,
            and ultimately produce a tribunal report explaining the failure mechanism.
          </p>
          <ol className={s.briefingSteps}>
            <li>Open each section of the file to examine the evidence</li>
            <li>Use the activities in the sidebar to guide your investigation</li>
            <li>Apply the key physics concepts available in the toolkit to inform your report</li>
          </ol>
        </div>

        <div className={s.briefingFooter}>
          <button className={s.briefingBtn} onClick={onBegin}>Begin Investigation →</button>
        </div>
      </div>
    </div>
  )
}
