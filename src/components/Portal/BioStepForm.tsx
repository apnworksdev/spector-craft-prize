'use client'

import { ApplicationWizard } from '@/components/Portal/ApplicationWizard'
import { useWizardFieldError } from '@/components/Portal/WizardFieldErrors'
import { BIO_SUMMARY_MAX_WORDS } from '@/lib/portal-media'
import { PORTAL_PATHS, type WizardStep } from '@/lib/portal'
import type { Application } from '@/payload-types'

import { TextArea, Title } from './ui'

type BioStepFormProps = {
  application: Application
  readOnly: boolean
  busy?: boolean
  onBack?: (data: Partial<Application>) => void
  onContinue?: (data: Partial<Application>) => void
  onSaveAndExit?: (data: Partial<Application>) => void
  onSelectStep?: (step: WizardStep, data: Partial<Application>) => void
  reachedIndex?: number
}

function BioFields({ application, readOnly }: { application: Application; readOnly: boolean }) {
  const educationalError = useWizardFieldError('educationalBackground')
  const summaryError = useWizardFieldError('biographicalSummary')

  return (
    <>
      <Title as="h2" caps>
        Biographical information
      </Title>
      <TextArea
        defaultValue={application.educationalBackground ?? ''}
        error={educationalError}
        label="Educational background*"
        name="educationalBackground"
        readOnly={readOnly}
      />
      <TextArea
        defaultValue={application.recentExhibitions ?? ''}
        label="Recent exhibitions (if any)"
        name="recentExhibitions"
        readOnly={readOnly}
      />
      <TextArea
        defaultValue={application.awardsRecognition ?? ''}
        label="Awards/recognition (if any)"
        name="awardsRecognition"
        readOnly={readOnly}
      />
      <TextArea
        defaultValue={application.biographicalSummary ?? ''}
        error={summaryError}
        hint={`Provide a concise biographical note highlighting key aspects of your background, education, and career development. ${BIO_SUMMARY_MAX_WORDS} words maximum.`}
        label="Biographical summary*"
        name="biographicalSummary"
        readOnly={readOnly}
      />
    </>
  )
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
      <BioFields application={application} readOnly={readOnly} />
    </ApplicationWizard>
  )
}
