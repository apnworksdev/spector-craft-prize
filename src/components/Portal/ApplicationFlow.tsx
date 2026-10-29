'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { BioStepForm } from '@/components/Portal/BioStepForm'
import { EligibilityStepForm } from '@/components/Portal/EligibilityStepForm'
import { MediaStepForm } from '@/components/Portal/MediaStepForm'
import { PersonalStepForm } from '@/components/Portal/PersonalStepForm'
import { SubmitStepForm } from '@/components/Portal/SubmitStepForm'
import { WorkStepForm } from '@/components/Portal/WorkStepForm'
import {
  firstInvalidField,
  wizardStepForField,
  type FieldErrors,
} from '@/lib/application-validation'
import { enqueueApplicationSave } from '@/lib/application-save-queue'
import {
  applicationDeadlineLabel,
  PORTAL_PATHS,
  programRulesHref,
  wizardStepFromPathname,
  WIZARD_STEP_HREF,
  WIZARD_STEPS,
  type WizardStep,
} from '@/lib/portal'
import type { Application, Program } from '@/payload-types'

import { Text, TextLink } from './ui'
import styles from './portal.module.css'

type ApplicationFlowProps = {
  application: Application
  program: Program
  readOnly: boolean
}

export function ApplicationFlow({ application, program, readOnly }: ApplicationFlowProps) {
  const router = useRouter()
  const pathname = usePathname()
  const step = wizardStepFromPathname(pathname)
  const [draft, setDraftState] = useState(application)
  const [error, setError] = useState('')
  const [savingExit, setSavingExit] = useState(false)
  const [focusCue, setFocusCue] = useState<{ token: number; errors: FieldErrors } | null>(null)
  const draftRef = useRef(application)
  const applicationIdRef = useRef(application.id)

  function setDraft(next: Application) {
    draftRef.current = next
    setDraftState(next)
  }

  function patchDraft(data: Partial<Application>) {
    const next = { ...draftRef.current, ...data }
    draftRef.current = next
    setDraftState(next)
    return next
  }

  // Layout stays mounted across steps. Only reset if the applicant gets a different application.
  useEffect(() => {
    if (application.id === applicationIdRef.current) {
      return
    }
    applicationIdRef.current = application.id
    draftRef.current = application
    setDraftState(application)
  }, [application])

  function handleGoToMissingField(errors: FieldErrors) {
    const field = firstInvalidField(errors)
    if (!field) {
      return
    }

    const target = wizardStepForField(field)
    setFocusCue((previous) => ({
      token: (previous?.token ?? 0) + 1,
      errors,
    }))
    setError('')
    router.replace(WIZARD_STEP_HREF[target], { scroll: false })
  }

  function handleContinue(from: WizardStep, data: Partial<Application>) {
    if (readOnly) {
      return
    }

    const next = WIZARD_STEPS[WIZARD_STEPS.indexOf(from) + 1]
    if (!next) {
      return
    }

    navigateToStep(next, data)
  }

  async function handleSaveAndExit(data: Partial<Application>) {
    if (readOnly) {
      router.push(PORTAL_PATHS.welcome)
      return
    }

    patchDraft(data)
    setSavingExit(true)
    setError('')

    const result = await enqueueApplicationSave(application.id, data)
    if (!result.ok) {
      setError(result.error)
      setSavingExit(false)
      return
    }

    router.push(PORTAL_PATHS.welcome)
  }

  function navigateToStep(target: WizardStep, data: Partial<Application>) {
    if (target === step) {
      return
    }

    if (readOnly) {
      setError('')
      router.replace(WIZARD_STEP_HREF[target], { scroll: false })
      return
    }

    patchDraft(data)
    setError('')
    router.replace(WIZARD_STEP_HREF[target], { scroll: false })

    void enqueueApplicationSave(application.id, data).then((result) => {
      if (!result.ok) {
        setError(result.error)
      }
    })
  }

  function handleBack(from: WizardStep, data: Partial<Application>) {
    const previous = WIZARD_STEPS[WIZARD_STEPS.indexOf(from) - 1]
    if (!previous) {
      return
    }

    navigateToStep(previous, data)
  }

  function handleSelectStep(target: WizardStep, data: Partial<Application>) {
    navigateToStep(target, data)
  }

  const navigation = {
    busy: savingExit,
    onBack: step === 'personal' ? undefined : (data: Partial<Application>) => handleBack(step, data),
    onContinue:
      step === 'submit' ? undefined : (data: Partial<Application>) => handleContinue(step, data),
    onSaveAndExit: handleSaveAndExit,
    onSelectStep: handleSelectStep,
    initialFieldErrors: focusCue?.errors,
    focusToken: focusCue?.token,
  }

  const rulesHref = programRulesHref(
    typeof program.rulesDocument === 'object' ? program.rulesDocument : null,
  )
  const deadline = applicationDeadlineLabel(program.deadline)

  return (
    <div className={styles.flowLayout}>
      <div className={styles.flowMeta}>
        <span>{program.name}</span>
        {deadline ? <span>Deadline {deadline}</span> : null}
        <TextLink href={rulesHref} target="_blank">
          Rules of Entry
        </TextLink>
      </div>
      {error ? <Text variant="error">{error}</Text> : null}
      {step === 'personal' ? (
        <PersonalStepForm application={draft} readOnly={readOnly} {...navigation} />
      ) : null}
      {step === 'eligibility' ? (
        <EligibilityStepForm application={draft} readOnly={readOnly} {...navigation} />
      ) : null}
      {step === 'bio' ? (
        <BioStepForm application={draft} readOnly={readOnly} {...navigation} />
      ) : null}
      {step === 'work' ? (
        <WorkStepForm application={draft} readOnly={readOnly} {...navigation} />
      ) : null}
      {step === 'media' ? (
        <MediaStepForm
          application={draft}
          onDraft={(data) => {
            patchDraft(data)
          }}
          readOnly={readOnly}
          {...navigation}
        />
      ) : null}
      {step === 'submit' ? (
        <SubmitStepForm
          application={draft}
          onApplicationPatch={(data) => {
            patchDraft(data)
          }}
          onGoToMissingField={handleGoToMissingField}
          program={program}
          readOnly={readOnly}
          {...navigation}
        />
      ) : null}
    </div>
  )
}
