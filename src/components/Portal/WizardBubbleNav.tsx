'use client'

import type { CSSProperties } from 'react'

import { formsFillRatio, stepFillRatio } from '@/lib/application-progress'
import { FORM_STEPS, type WizardStep } from '@/lib/portal'
import type { Application } from '@/payload-types'

import styles from './portal.module.css'

type PhaseKey = 'forms' | 'media' | 'submit'

const PHASES: Array<{ key: PhaseKey; label: string; step: WizardStep }> = [
  { key: 'forms', label: 'Forms', step: 'personal' },
  { key: 'media', label: 'Media', step: 'media' },
  { key: 'submit', label: 'Submit', step: 'submit' },
]

const FORM_LABELS: Record<(typeof FORM_STEPS)[number], string> = {
  personal: 'Personal information',
  eligibility: 'Eligibility confirmation',
  bio: 'Biographical information',
  work: 'Submitted work',
}

function phaseRatio(phase: PhaseKey, application: Application): number {
  switch (phase) {
    case 'forms':
      return formsFillRatio(application)
    case 'media':
      return stepFillRatio(application, 'media')
    case 'submit':
      return stepFillRatio(application, 'submit')
    default:
      return 0
  }
}

function fillStyle(ratio: number): CSSProperties {
  return { '--bubble-fill': `${Math.round(ratio * 100)}%` } as CSSProperties
}

type WizardBubbleNavProps = {
  step: WizardStep
  application?: Application
  onSelectStep?: (step: WizardStep) => void
}

export function WizardBubbleNav({
  step,
  application,
  onSelectStep,
}: WizardBubbleNavProps) {
  const activePhase: PhaseKey = (FORM_STEPS as readonly WizardStep[]).includes(step)
    ? 'forms'
    : (step as PhaseKey)

  function pill(
    label: string,
    ratio: number,
    options: { current?: boolean; onClick?: () => void; compact?: boolean },
  ) {
    const percent = Math.round(ratio * 100)
    const complete = percent >= 100
    const className = [styles.bubble, options.compact ? styles.bubbleCompact : null, options.onClick ? styles.bubbleButton : null]
      .filter(Boolean)
      .join(' ')
    const shared = {
      'aria-current': options.current ? ('step' as const) : undefined,
      'aria-label': `${label}, ${percent} percent complete`,
      className,
      'data-active': options.current ? '' : undefined,
      'data-complete': complete ? '' : undefined,
      'data-started': percent > 0 && !complete ? '' : undefined,
      style: fillStyle(ratio),
    }

    if (options.onClick) {
      return (
        <button {...shared} onClick={options.onClick} type="button">
          {label}
        </button>
      )
    }

    return <span {...shared}>{label}</span>
  }

  return (
    <nav aria-label="Application steps" className={styles.bubbleNav}>
      <ol className={styles.bubbleTrack}>
        {PHASES.map((phase, index) => {
          const active = phase.key === activePhase
          const ratio = application ? phaseRatio(phase.key, application) : 0
          const canSelect = Boolean(onSelectStep) && !active
          const lineFilled = ratio >= 1

          return (
            <li className={styles.bubbleSlot} key={phase.key}>
              {pill(phase.label, ratio, {
                current: active,
                onClick: canSelect ? () => onSelectStep?.(phase.step) : undefined,
              })}
              {index < PHASES.length - 1 ? (
                <span
                  aria-hidden
                  className={[styles.bubbleLine, lineFilled ? styles.bubbleLineFilled : null]
                    .filter(Boolean)
                    .join(' ')}
                />
              ) : null}
            </li>
          )
        })}
      </ol>

      {activePhase === 'forms' ? (
        <ol className={`${styles.bubbleTrack} ${styles.bubbleTrackSub}`}>
          {FORM_STEPS.map((key, index) => {
            const active = key === step
            const ratio = application ? stepFillRatio(application, key) : 0
            const canSelect = Boolean(onSelectStep) && !active
            const lineFilled = ratio >= 1

            return (
              <li className={styles.bubbleSlot} key={key}>
                {pill(FORM_LABELS[key], ratio, {
                  compact: true,
                  current: active,
                  onClick:
                    canSelect && onSelectStep
                      ? () => onSelectStep(key)
                      : undefined,
                })}
                {index < FORM_STEPS.length - 1 ? (
                  <span
                    aria-hidden
                    className={[styles.bubbleLine, lineFilled ? styles.bubbleLineFilled : null]
                      .filter(Boolean)
                      .join(' ')}
                  />
                ) : null}
              </li>
            )
          })}
        </ol>
      ) : null}
    </nav>
  )
}
