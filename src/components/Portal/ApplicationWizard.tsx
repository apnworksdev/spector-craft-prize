'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useRef, useState } from 'react'

import { stepComplete } from '@/lib/application-progress'
import { enqueueApplicationSave } from '@/lib/application-save-queue'
import { FORM_STEPS, PORTAL_PATHS, WIZARD_STEPS, type WizardStep } from '@/lib/portal'
import type { Application } from '@/payload-types'

import { Actions, Button, FormStack, Panel, Text, TextLink } from './ui'
import styles from './portal.module.css'

type ApplicationWizardProps = {
  applicationId: number
  step: WizardStep
  readOnly: boolean
  nextHref?: string
  backHref?: string
  busy?: boolean
  application?: Application
  getData: (form: HTMLFormElement) => Partial<Application>
  onBack?: () => void
  onContinue?: (data: Partial<Application>) => void | Promise<void>
  onSaveAndExit?: (data: Partial<Application>) => void
  onSelectStep?: (step: WizardStep, data: Partial<Application>) => void
  reachedIndex?: number
  children: React.ReactNode
}

const STEP_LABELS: Record<WizardStep, string> = {
  personal: 'Personal information',
  eligibility: 'Eligibility confirmation',
  bio: 'Biographical information',
  work: 'Submitted work',
  media: 'Media',
  submit: 'Submit',
}

const PHASES: Array<{ key: 'forms' | 'media' | 'submit'; label: string; step: WizardStep }> = [
  { key: 'forms', label: 'Forms', step: 'personal' },
  { key: 'media', label: 'Media', step: 'media' },
  { key: 'submit', label: 'Submit', step: 'submit' },
]

export function ApplicationWizard({
  applicationId,
  step,
  readOnly,
  nextHref,
  backHref,
  busy = false,
  application,
  getData,
  onBack,
  onContinue,
  onSaveAndExit,
  onSelectStep,
  reachedIndex,
  children,
}: ApplicationWizardProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const currentIndex = WIZARD_STEPS.indexOf(step)
  const openedThrough = reachedIndex ?? currentIndex
  const activePhase = (FORM_STEPS as readonly WizardStep[]).includes(step) ? 'forms' : step

  async function persist(form: HTMLFormElement, href?: string) {
    setSaving(true)
    setError('')
    const result = await enqueueApplicationSave(applicationId, getData(form))

    if (!result.ok) {
      setError(result.error)
      setSaving(false)
      return
    }

    if (href) {
      router.push(href)
      return
    }

    router.refresh()
    setSaving(false)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (readOnly) {
      return
    }

    const data = getData(event.currentTarget)
    if (onContinue) {
      setSaving(true)
      setError('')
      await onContinue(data)
      setSaving(false)
      return
    }

    await persist(event.currentTarget, nextHref)
  }

  return (
    <Panel width="wide">
      <div className={styles.stepperGroup}>
        <div className={styles.stepper}>
        {PHASES.map((phase, index) => {
          const phaseIndex = WIZARD_STEPS.indexOf(phase.step)
          const active = phase.key === activePhase
          const reachable = phaseIndex <= openedThrough
          const className = active ? styles.stepActive : reachable ? styles.stepFilled : styles.step
          const label = `${index + 1} ${phase.label}`

          if (active || !reachable || !onSelectStep) {
            return (
              <span
                aria-current={active ? 'step' : undefined}
                className={className}
                key={phase.key}
              >
                {label}
              </span>
            )
          }

          return (
            <button
              className={`${className} ${styles.stepLink}`}
              key={phase.key}
              onClick={() => {
                if (!formRef.current) {
                  return
                }

                onSelectStep(phase.step, getData(formRef.current))
              }}
              type="button"
            >
              {label}
            </button>
          )
        })}
        </div>
        {activePhase === 'forms' ? (
        <div className={styles.stepper}>
        {FORM_STEPS.map((key, index) => {
          const stepIndex = WIZARD_STEPS.indexOf(key)
          const reached = key !== step && stepIndex <= openedThrough
          const filled =
            reached || Boolean(application && key !== step && stepComplete(application, key))
          const canSelect = Boolean(onSelectStep) && filled
          const className =
            key === step ? styles.stepActive : filled ? styles.stepFilled : styles.step
          const label = `${index + 1} ${STEP_LABELS[key]}`

          if (!canSelect) {
            return (
              <span
                aria-current={key === step ? 'step' : undefined}
                className={className}
                key={key}
              >
                {label}
              </span>
            )
          }

          return (
            <button
              className={`${className} ${styles.stepLink}`}
              key={key}
              onClick={() => {
                if (!formRef.current) {
                  return
                }

                onSelectStep?.(key, getData(formRef.current))
              }}
              type="button"
            >
              {label}
            </button>
          )
        })}
        </div>
        ) : null}
      </div>

      <FormStack onSubmit={onSubmit} ref={formRef}>
        <fieldset className={styles.wizardFieldset} disabled={readOnly || saving || busy}>
          <div className={styles.wizardFields}>{children}</div>
        </fieldset>

        {error ? <Text variant="error">{error}</Text> : null}

        <Actions>
          {onBack ? (
            <Button onClick={onBack} variant="link">
              &lt; Back
            </Button>
          ) : backHref ? (
            <TextLink href={backHref}>&lt; Back</TextLink>
          ) : null}
          {!readOnly ? (
            <>
              <Button
                onClick={(event) => {
                  event.preventDefault()
                  const form = event.currentTarget.form
                  if (!form) {
                    return
                  }

                  const data = getData(form)
                  if (onSaveAndExit) {
                    onSaveAndExit(data)
                    return
                  }

                  void persist(form, PORTAL_PATHS.welcome)
                }}
              >
                Save and exit
              </Button>
              {nextHref || onContinue ? (
                <Button type="submit" variant="primary">
                  Continue &gt;
                </Button>
              ) : null}
            </>
          ) : (
            <TextLink href={PORTAL_PATHS.welcome}>Back to welcome</TextLink>
          )}
        </Actions>
      </FormStack>
    </Panel>
  )
}
