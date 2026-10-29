'use client'

import { useEffect, useState } from 'react'

import { applicationSectionsComplete } from '@/lib/application-progress'
import type { FieldErrors } from '@/lib/application-validation'
import { GOVERNMENT_ID_ACCEPT } from '@/lib/portal-media'
import { enqueueApplicationSave } from '@/lib/application-save-queue'
import { uploadSubmissionFile } from '@/lib/portal-upload'
import type { Application, Program, SubmissionFile } from '@/payload-types'
import { PORTAL_PATHS, type WizardStep } from '@/lib/portal'

import { ApplicationWizard } from './ApplicationWizard'
import { SubmitStep } from './SubmitStep'
import { FileField, type FileFieldPreview, Text } from './ui'

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

function previewFromFile(
  file: SubmissionFile | number | null | undefined,
  local?: FileFieldPreview | null,
): FileFieldPreview | null {
  if (local) {
    return local
  }

  if (!file || typeof file !== 'object') {
    return null
  }

  const mime = file.mimeType || ''
  if (mime.startsWith('image/') && file.url) {
    return { kind: 'image', src: file.url, name: file.filename }
  }

  if (mime === 'application/pdf' || file.filename?.toLowerCase().endsWith('.pdf')) {
    return { kind: 'pdf', name: file.filename || 'PDF on file' }
  }

  if (file.url) {
    return { kind: 'image', src: file.url, name: file.filename }
  }

  return file.filename ? { kind: 'pdf', name: file.filename } : null
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
  const [uploadError, setUploadError] = useState('')
  const [governmentIdError, setGovernmentIdError] = useState('')
  const [localPreview, setLocalPreview] = useState<FileFieldPreview | null>(null)
  const sectionsReady = readOnly || applicationSectionsComplete(application)
  const hasGovernmentId = Boolean(application.governmentId)
  const preview = previewFromFile(
    typeof application.governmentId === 'object' ? application.governmentId : null,
    localPreview,
  )

  useEffect(() => {
    return () => {
      if (localPreview?.src?.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview.src)
      }
    }
  }, [localPreview])

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
            fileStatus={hasGovernmentId && !preview ? 'File on file' : null}
            label="Upload government issued ID"
            name="governmentId"
            preview={preview}
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) {
                return
              }

              setUploadError('')
              setGovernmentIdError('')

              if (localPreview?.src?.startsWith('blob:')) {
                URL.revokeObjectURL(localPreview.src)
              }

              const isPdf =
                file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
              const nextPreview: FileFieldPreview = isPdf
                ? { kind: 'pdf', name: file.name }
                : { kind: 'image', src: URL.createObjectURL(file), name: file.name }
              setLocalPreview(nextPreview)

              const uploaded = await uploadSubmissionFile(file, 'id')
              if ('error' in uploaded) {
                setUploadError(uploaded.error)
                setLocalPreview(null)
                return
              }

              const result = await enqueueApplicationSave(application.id, {
                governmentId: uploaded.id,
              })
              if (!result.ok) {
                setUploadError(result.error)
                setLocalPreview(null)
                return
              }

              if (uploaded.url && nextPreview.kind === 'image') {
                if (nextPreview.src?.startsWith('blob:')) {
                  URL.revokeObjectURL(nextPreview.src)
                }
                setLocalPreview({ kind: 'image', src: uploaded.url, name: file.name })
              }

              onApplicationPatch?.({
                governmentId: uploaded.url
                  ? ({
                      id: uploaded.id,
                      url: uploaded.url,
                      mimeType: file.type,
                      filename: file.name,
                    } as Application['governmentId'])
                  : uploaded.id,
              })
            }}
          />
        </div>
      ) : null}
    </ApplicationWizard>
  )
}
