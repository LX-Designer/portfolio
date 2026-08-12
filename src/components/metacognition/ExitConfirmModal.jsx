import s from './index.module.css'

export default function ExitConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className={s.exitModal} onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className={s.exitBox}>
        <h3>Exit the guided journey?</h3>
        <p>Your progress is saved, so you can resume anytime.</p>
        <div className={s.exitFooter}>
          <button className={`${s.exitBtn} ${s.secondary}`} onClick={onCancel}>Keep going</button>
          <button className={`${s.exitBtn} ${s.primary}`} onClick={onConfirm}>Exit journey</button>
        </div>
      </div>
    </div>
  )
}
