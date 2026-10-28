'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useRef, useState } from 'react'

import { WizardBubbleNav } from '@/components/Portal/WizardBubbleNav'
import { WizardFieldErrorsProvider } from '@/components/Portal/WizardFieldErrors'
import {
  mergeApplication,
  validateWizardStep,
  focusFirstInvalidField,
  type FieldErrors,
} from '@/lib/application-validation'
import { enqueueApplicationSave } from '@/lib/application-save-queue'
import { PORTAL_PATHS, type WizardStep } from '@/lib/portal'
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
  onBack?: (data: Partial<Application>) => void
  onContinue?: (data: Partial<Application>) => void | Promise<void>
  onSaveAndExit?: (data: Partial<Application>) => void
  onSelectStep?: (step: WizardStep, data: Partial<Application>) => void
  /** Errors from a failed submit attempt; paired with focusToken to re-focus. */
  initialFieldErrors?: FieldErrors
  focusToken?: number
  children: React.ReactNode
}

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
  initialFieldErrors,
  focusToken,
  children,
}: ApplicationWizardProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [liveApplication, setLiveApplication] = useState<Application | null>(
    application ?? null,
  )

  useEffect(() => {
    setLiveApplication(application ?? null)
  }, [application])

  useEffect(() => {
    if (focusToken == null || !initialFieldErrors || Object.keys(initialFieldErrors).length === 0) {
      return
    }

    setFieldErrors(initialFieldErrors)
    const frame = window.requestAnimationFrame(() => {
      focusFirstInvalidField(initialFieldErrors)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [focusToken, initialFieldErrors])
  function refreshLivePreview(form: HTMLFormElement) {
    if (!application) {
      return
    }

    setLiveApplication(mergeApplication(application, getData(form)))
  }

  function validateCurrentStep(form: HTMLFormElement, requireComplete = false) {
    if (!application) {
      return {}
    }

    const merged = mergeApplication(application, getData(form))
    // Continue / forward nav allows incomplete sections; still catch invalid filled values.
    const errors = validateWizardStep(step, merged, { requireComplete })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      focusFirstInvalidField(errors)
    }
    return errors
  }

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

    // Continue checks this step only. Bubbles skip validation. Submit checks everything.
    const errors = validateCurrentStep(event.currentTarget, true)
    if (Object.keys(errors).length > 0) {
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

  function trySelectStep(target: WizardStep) {
    if (!formRef.current || !onSelectStep) {
      return
    }

    setFieldErrors({})
    setError('')
    onSelectStep(target, getData(formRef.current))
  }

  const progressApplication = liveApplication ?? application

  return (
    <Panel width="wide">
      <WizardBubbleNav
        application={progressApplication ?? undefined}
        onSelectStep={onSelectStep ? trySelectStep : undefined}
        step={step}
      />

      <WizardFieldErrorsProvider errors={fieldErrors}>
        <FormStack
          onInput={(event) => {
            if (event.currentTarget instanceof HTMLFormElement) {
              refreshLivePreview(event.currentTarget)
            }
          }}
          onSubmit={onSubmit}
          ref={formRef}
        >
          <fieldset className={styles.wizardFieldset} disabled={readOnly || saving || busy}>
            <div className={styles.wizardFields}>{children}</div>
          </fieldset>

          {error ? <Text variant="error">{error}</Text> : null}

          <Actions className={styles.wizardActions}>
            {onBack ? (
              <Button
                onClick={() => {
                  const form = formRef.current
                  if (!form) {
                    return
                  }

                  onBack(getData(form))
                }}
                variant="link"
              >
                &lt; Back
              </Button>
            ) : backHref ? (
              <TextLink href={backHref}>&lt; Back</TextLink>
            ) : (
              <span />
            )}
            <div className={styles.wizardActionsEnd}>
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
            </div>
          </Actions>
        </FormStack>
      </WizardFieldErrorsProvider>
    </Panel>
  )
}
