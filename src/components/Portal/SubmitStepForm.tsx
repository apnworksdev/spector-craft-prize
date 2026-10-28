'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { applicationSectionsComplete } from '@/lib/application-progress'
import type { FieldErrors } from '@/lib/application-validation'
import { GOVERNMENT_ID_ACCEPT } from '@/lib/portal-media'
import { enqueueApplicationSave } from '@/lib/application-save-queue'
import { uploadSubmissionFile } from '@/lib/portal-upload'
import type { Application, Program } from '@/payload-types'
import { PORTAL_PATHS, type WizardStep } from '@/lib/portal'

import { ApplicationWizard } from './ApplicationWizard'
import { SubmitStep } from './SubmitStep'
import { FileField, Text } from './ui'

type SubmitStepFormProps = {
  application: Application
  program: Program
  readOnly: boolean
  busy?: boolean
  onBack?: (data: Partial<Application>) => void
  onContinue?: (data: Partial<Application>) => void
  onSaveAndExit?: (data: Partial<Application>) => void
  onSelectStep?: (step: WizardStep, data: Partial<Application>) => void
  onApplicationPatch?: (data: Partial<Application>) => void
  onGoToMissingField?: (errors: FieldErrors) => void
  initialFieldErrors?: FieldErrors
  focusToken?: number
}

export function SubmitStepForm({
  application,
  program,
  readOnly,
  busy,
  onBack,
  onContinue,
  onSaveAndExit,
  onSelectStep,
  onApplicationPatch,
  onGoToMissingField,
  initialFieldErrors,
  focusToken,
}: SubmitStepFormProps) {
  const router = useRouter()
  const [uploadError, setUploadError] = useState('')
  const [governmentIdError, setGovernmentIdError] = useState('')
  const sectionsReady = readOnly || applicationSectionsComplete(application)
  const hasGovernmentId = Boolean(application.governmentId)

  return (
    <ApplicationWizard
      application={application}
      applicationId={application.id}
      backHref={onBack ? undefined : PORTAL_PATHS.media}
      busy={busy}
      focusToken={focusToken}
      getData={(form) => {
        const declarationsAccepted = (program.declarations ?? []).map((_, index) => {
          const field = form.elements.namedItem(`declaration_${index}`)
          return {
            accepted: field instanceof HTMLInputElement ? field.checked : false,
          }
        })

        return { declarationsAccepted }
      }}
      initialFieldErrors={initialFieldErrors}
      onBack={onBack}
      onContinue={onContinue}
      onSaveAndExit={onSaveAndExit}
      onSelectStep={onSelectStep}
      readOnly={readOnly}
      step="submit"
    >
      <SubmitStep
        application={application}
        applicationId={application.id}
        declarationState={application.declarationsAccepted}
        onGoToMissingField={onGoToMissingField}
        onGovernmentIdError={setGovernmentIdError}
        program={program}
        readOnly={readOnly}
        sectionsReady={sectionsReady}
      />
      {sectionsReady && readOnly ? (
        <Text>
          {hasGovernmentId
            ? 'Government-issued ID is on file.'
            : 'No government-issued ID was uploaded.'}
        </Text>
      ) : null}
      {!readOnly ? (
        <div id="governmentId" tabIndex={-1}>
          <FileField
            accept={GOVERNMENT_ID_ACCEPT}
            hint="JPG, PNG, or PDF."
            error={governmentIdError || uploadError || undefined}
            fileStatus={hasGovernmentId ? 'File on file' : null}
            label="Upload government issued ID"
            name="governmentId"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) {
                return
              }

              setUploadError('')
              setGovernmentIdError('')

              const uploaded = await uploadSubmissionFile(file, 'id')
              if ('error' in uploaded) {
                setUploadError(uploaded.error)
                return
              }

              const result = await enqueueApplicationSave(application.id, {
                governmentId: uploaded.id,
              })
              if (!result.ok) {
                setUploadError(result.error)
                return
              }

              onApplicationPatch?.({ governmentId: uploaded.id })
              router.refresh()
            }}
          />
        </div>
      ) : null}
    </ApplicationWizard>
  )
}
