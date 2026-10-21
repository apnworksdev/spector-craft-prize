'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { BioStepForm } from '@/components/Portal/BioStepForm'
import { EligibilityStepForm } from '@/components/Portal/EligibilityStepForm'
import { MediaStepForm } from '@/components/Portal/MediaStepForm'
import { PersonalStepForm } from '@/components/Portal/PersonalStepForm'
import { SubmitStepForm } from '@/components/Portal/SubmitStepForm'
import { WorkStepForm } from '@/components/Portal/WorkStepForm'
import { furthestAllowedStep } from '@/lib/application-progress'
import { enqueueApplicationSave } from '@/lib/application-save-queue'
import {
  formatPortalDate,
  PORTAL_PATHS,
  WIZARD_STEP_HREF,
  WIZARD_STEPS,
  type WizardStep,
} from '@/lib/portal'
import type { Application, Program } from '@/payload-types'

import { Text, TextLink } from './ui'
import styles from './portal.module.css'

type ApplicationFlowProps = {
  application: Application
  initialStep: WizardStep
  program: Program
  readOnly: boolean
}

export function ApplicationFlow({
  application,
  initialStep,
  program,
  readOnly,
}: ApplicationFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState(initialStep)
  const [draft, setDraft] = useState(application)
  const [error, setError] = useState('')
  const [savingExit, setSavingExit] = useState(false)
  const [furthestIndex, setFurthestIndex] = useState(() => {
    if (readOnly) {
      return WIZARD_STEPS.length - 1
    }

    // Unlock through the first incomplete step (e.g. bio done → work is clickable even if half-filled).
    return Math.max(
      WIZARD_STEPS.indexOf(initialStep),
      WIZARD_STEPS.indexOf(furthestAllowedStep(application)),
    )
  })
  const draftRef = useRef(application)

  function reach(target: WizardStep) {
    setFurthestIndex((current) => Math.max(current, WIZARD_STEPS.indexOf(target)))
  }

  async function handleContinue(from: WizardStep, data: Partial<Application>) {
    if (readOnly) {
      return
    }

    const nextDraft = { ...draftRef.current, ...data }
    const next = WIZARD_STEPS[WIZARD_STEPS.indexOf(from) + 1]
    if (!next) {
      return
    }

    setError('')
    const result = await enqueueApplicationSave(application.id, data)
    if (!result.ok) {
      setError(result.error)
      return
    }

    draftRef.current = nextDraft
    setDraft(nextDraft)
    reach(next)
    setStep(next)
    router.replace(WIZARD_STEP_HREF[next], { scroll: false })
  }

  async function handleSaveAndExit(data: Partial<Application>) {
    if (readOnly) {
      router.push(PORTAL_PATHS.welcome)
      return
    }

    const nextDraft = { ...draftRef.current, ...data }
    draftRef.current = nextDraft
    setDraft(nextDraft)
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
    const from = step
    if (target === from) {
      return
    }

    if (readOnly) {
      setError('')
      setStep(target)
      router.replace(WIZARD_STEP_HREF[target], { scroll: false })
      return
    }

    const nextDraft = { ...draftRef.current, ...data }
    draftRef.current = nextDraft
    setDraft(nextDraft)
    setError('')
    setStep(target)
    router.replace(WIZARD_STEP_HREF[target], { scroll: false })

    void enqueueApplicationSave(application.id, data).then((result) => {
      if (!result.ok) {
        setStep(from)
        setError(result.error)
      }
    })
  }

  function handleBack(from: WizardStep, data: Partial<Application>) {
    const previous = WIZARD_STEPS[WIZARD_STEPS.indexOf(from) - 1]
    if (!previous) {
      return
    }

    reach(previous)
    navigateToStep(previous, data)
  }

  function handleSelectStep(target: WizardStep, data: Partial<Application>) {
    if (WIZARD_STEPS.indexOf(target) > furthestIndex) {
      return
    }

    navigateToStep(target, data)
  }

  const navigation = {
    busy: savingExit,
    onBack: step === 'personal' ? undefined : (data: Partial<Application>) => handleBack(step, data),
    onContinue:
      step === 'submit' ? undefined : (data: Partial<Application>) => handleContinue(step, data),
    onSaveAndExit: handleSaveAndExit,
    onSelectStep: handleSelectStep,
    reachedIndex: furthestIndex,
  }

  const rulesDocument = program.rulesDocument
  const rulesHref =
    rulesDocument && typeof rulesDocument === 'object' && rulesDocument.url
      ? rulesDocument.url
      : null
  const deadline = formatPortalDate(program.deadline)

  return (
    <div className={styles.flowLayout}>
      <div className={styles.flowMeta}>
        <span>{program.name}</span>
        {deadline ? <span>Deadline {deadline}</span> : null}
        {rulesHref ? <TextLink href={rulesHref}>Rules of Entry</TextLink> : null}
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
            const nextDraft = { ...draftRef.current, ...data }
            draftRef.current = nextDraft
            setDraft(nextDraft)
          }}
          readOnly={readOnly}
          {...navigation}
        />
      ) : null}
      {step === 'submit' ? (
        <SubmitStepForm
          application={draft}
          onApplicationPatch={(data) => {
            const nextDraft = { ...draftRef.current, ...data }
            draftRef.current = nextDraft
            setDraft(nextDraft)
          }}
          program={program}
          readOnly={readOnly}
          {...navigation}
        />
      ) : null}
    </div>
  )
}
