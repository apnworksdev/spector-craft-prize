'use client'

import { ApplicationWizard } from '@/components/Portal/ApplicationWizard'
import { BIO_SUMMARY_MAX_WORDS } from '@/lib/portal-media'
import { PORTAL_PATHS, type WizardStep } from '@/lib/portal'
import type { Application } from '@/payload-types'

import { TextArea, Title } from './ui'

type BioStepFormProps = {
  application: Application
  readOnly: boolean
  busy?: boolean
  onBack?: () => void
  onContinue?: (data: Partial<Application>) => void
  onSaveAndExit?: (data: Partial<Application>) => void
  onSelectStep?: (step: WizardStep, data: Partial<Application>) => void
  reachedIndex?: number
}

export function BioStepForm({
  application,
  readOnly,
  busy,
  onBack,
  onContinue,
  onSaveAndExit,
  onSelectStep,
  reachedIndex,
}: BioStepFormProps) {
  return (
    <ApplicationWizard
      application={application}
      applicationId={application.id}
      backHref={onBack ? undefined : `${PORTAL_PATHS.application}/eligibility`}
      busy={busy}
      getData={(form) => ({
        educationalBackground: String(
          (form.elements.namedItem('educationalBackground') as HTMLTextAreaElement | null)?.value ||
            '',
        ),
        recentExhibitions: String(
          (form.elements.namedItem('recentExhibitions') as HTMLTextAreaElement | null)?.value || '',
        ),
        awardsRecognition: String(
          (form.elements.namedItem('awardsRecognition') as HTMLTextAreaElement | null)?.value || '',
        ),
        biographicalSummary: String(
          (form.elements.namedItem('biographicalSummary') as HTMLTextAreaElement | null)?.value ||
            '',
        ),
      })}
      nextHref={onContinue ? undefined : PORTAL_PATHS.work}
      onBack={onBack}
      onContinue={onContinue}
      onSaveAndExit={onSaveAndExit}
      onSelectStep={onSelectStep}
      reachedIndex={reachedIndex}
      readOnly={readOnly}
      step="bio"
    >
      <Title as="h2">Biographical information</Title>
      <TextArea
        defaultValue={application.educationalBackground ?? ''}
        label="Educational background*"
        name="educationalBackground"
      />
      <TextArea
        defaultValue={application.recentExhibitions ?? ''}
        label="Recent exhibitions (if any)"
        name="recentExhibitions"
      />
      <TextArea
        defaultValue={application.awardsRecognition ?? ''}
        label="Awards/recognition (if any)"
        name="awardsRecognition"
      />
      <TextArea
        defaultValue={application.biographicalSummary ?? ''}
        hint={`Provide a concise biographical note highlighting key aspects of your background, education, and career development. ${BIO_SUMMARY_MAX_WORDS} words maximum.`}
        label="Biographical summary*"
        name="biographicalSummary"
      />
    </ApplicationWizard>
  )
}
