'use client'

import { applicationProgressPercent } from '@/lib/application-progress'
import type { Application } from '@/payload-types'

import styles from './portal.module.css'

type ApplicationProgressBarProps = {
  application: Application
}

export function ApplicationProgressBar({ application }: ApplicationProgressBarProps) {
  const percent = applicationProgressPercent(application)

  return (
    <div aria-label={`Application ${percent} percent complete`} className={styles.progress}>
      <div className={styles.progressMeta}>
        <span className={styles.progressLabel}>Application progress</span>
        <span className={styles.progressValue}>{percent}% complete</span>
      </div>
      <div aria-hidden className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
