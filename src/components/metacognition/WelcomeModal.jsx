import s from './index.module.css'

export default function WelcomeModal({ mode, onModeChange, hasProgress, isComplete, activityDoneCount, onStart, onReset }) {
  const startLabel = isComplete ? 'View my summary →' : hasProgress ? 'Resume where I left off →' : 'Begin →'

  return (
    <div className={s.welcomeModal}>
      <div className={s.wmBox}>
        <h2>Metacognition &amp; Self-Directed Learning</h2>
        <p className={s.wmSub}>
          An interactive literature review. Choose how you'd like to engage with the material — you can switch modes at any time using the navigation.
        </p>

        {hasProgress && (
          <div className={s.wmResume}>
            <div>
              <div className={s.wmResumeTitle}>Welcome back</div>
              <div className={s.wmResumeLabel}>
                {isComplete ? 'Journey complete — view your summary' : `${activityDoneCount} of 7 activities completed`}
              </div>
            </div>
            <button className={s.wmResumeReset} onClick={onReset}>Start fresh</button>
          </div>
        )}

        <div className={s.wmModes}>
          <div
            className={`${s.wmMode} ${mode === 'journey' ? s.selected : ''}`}
            onClick={() => onModeChange('journey')}
          >
            <div className={s.wmIcon}>🧭</div>
            <div className={s.wmTitle}>Guided Journey</div>
            <div className={s.wmDesc}>A 7-step learning path with interactive activities, scenario analysis, and a personal action plan. ~25–35 minutes. Recommended for deep understanding.</div>
          </div>
          <div
            className={`${s.wmMode} ${mode === 'explore' ? s.selected : ''}`}
            onClick={() => onModeChange('explore')}
          >
            <div className={s.wmIcon}>🗺️</div>
            <div className={s.wmTitle}>Explore Freely</div>
            <div className={s.wmDesc}>Navigate sections in any order, click to expand detail, and use the resource as a reference. No activities or guided steps.</div>
          </div>
        </div>

        <button className={s.wmStart} onClick={onStart}>{startLabel}</button>
        <p className={s.wmNote}>The Guided Journey is designed to model the same instructional principles the review describes.</p>
      </div>
    </div>
  )
}
