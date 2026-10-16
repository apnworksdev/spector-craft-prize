'use client'

import { useState } from 'react'

import { applicationSectionsComplete } from '@/lib/application-progress'
import { GOVERNMENT_ID_TYPES } from '@/lib/portal-media'
import { submitApplication } from '@/lib/portal-actions'
import { enqueueApplicationSave } from '@/lib/application-save-queue'
import { uploadSubmissionFile } from '@/lib/portal-upload'
import type { Application, Program } from '@/payload-types'
import { PORTAL_PATHS, type WizardStep } from '@/lib/portal'

import { ApplicationWizard } from './ApplicationWizard'
import { SubmitStep } from './SubmitStep'
import { FileField, Text, Title } from './ui'

type SubmitStepFormProps = {
  application: Application
  program: Program
  readOnly: boolean
  busy?: boolean
  onBack?: () => void
  onContinue?: (data: Partial<Application>) => void
  onSaveAndExit?: (data: Partial<Application>) => void
  onSelectStep?: (step: WizardStep, data: Partial<Application>) => void
  reachedIndex?: number
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
  reachedIndex,
}: SubmitStepFormProps) {
  const [error, setError] = useState('')
  const sectionsReady = readOnly || applicationSectionsComplete(application)

  return (
    <>
      <ApplicationWizard
        application={application}
        applicationId={application.id}
        backHref={onBack ? undefined : PORTAL_PATHS.media}
        busy={busy}
        getData={(form) => {
          const declarationsAccepted = (program.declarations ?? []).map((_, index) => {
            const field = form.elements.namedItem(`declaration_${index}`)
            return {
              accepted: field instanceof HTMLInputElement ? field.checked : false,
            }
          })

          return { declarationsAccepted }
        }}
        onBack={onBack}
        onContinue={onContinue}
        onSaveAndExit={onSaveAndExit}
        onSelectStep={onSelectStep}
        reachedIndex={reachedIndex}
        readOnly={readOnly}
        step="submit"
      >
        {sectionsReady ? (
          <SubmitStep
            applicationId={application.id}
            declarationState={application.declarationsAccepted}
            program={program}
            readOnly={readOnly}
          />
        ) : (
          <>
            <Title as="h2">Submit</Title>
            <Text>{program.incompleteMessage}</Text>
          </>
        )}
        {sectionsReady && readOnly ? (
          <Text>
            {application.governmentId
              ? 'Government-issued ID is on file.'
              : 'No government-issued ID was uploaded.'}
          </Text>
        ) : null}
        {sectionsReady && !readOnly ? (
          <FileField
            accept={GOVERNMENT_ID_TYPES.join(',')}
            label="Upload government issued ID"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) {
                return
              }

              const uploaded = await uploadSubmissionFile(file, 'id')
              if ('error' in uploaded) {
                setError(uploaded.error)
                return
              }

              await enqueueApplicationSave(application.id, { governmentId: uploaded.id })
            }}
          />
        ) : null}
        {error ? <Text variant="error">{error}</Text> : null}
      </ApplicationWizard>
    </>
  )
}
