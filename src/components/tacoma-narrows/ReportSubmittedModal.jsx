import s from './index.module.css'

// Appears once, right after the tribunal report (Activity 6) is submitted —
// dismissible via backdrop click, unlike WelcomeModal's mandatory briefing.
export default function ReportSubmittedModal({ onViewFindings, onClose }) {
  return (
    <div className={`${s.tnModal} ${s.visible}`} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={s.briefingBox}>
        <div className={s.briefingHeader}>
          <div className={s.briefingEyebrow}>Case 1940-TN-001 · Report Filed</div>
          <h2 className={s.briefingTitle}>Report Submitted</h2>
        </div>

        <div className={s.briefingBody}>
          <p className={s.briefingText}>
            Your tribunal report has been filed. The Post-Collapse Investigation findings are now
            unlocked in §06 of the case file: read them to see how your conclusions compare to
            the historical record.
          </p>
        </div>

        <div className={s.briefingFooter}>
          <button className={s.briefingBtn} onClick={onViewFindings}>View Findings →</button>
        </div>
      </div>
    </div>
  )
}
