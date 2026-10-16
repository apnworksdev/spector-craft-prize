'use client'

import { ApplicationWizard } from '@/components/Portal/ApplicationWizard'
import { PORTAL_PATHS, type WizardStep } from '@/lib/portal'
import type { Application } from '@/payload-types'

import { SelectField, TextArea, TextField, Title } from './ui'

type EligibilityStepFormProps = {
  application: Application
  readOnly: boolean
  busy?: boolean
  onBack?: () => void
  onContinue?: (data: Partial<Application>) => void
  onSaveAndExit?: (data: Partial<Application>) => void
  onSelectStep?: (step: WizardStep, data: Partial<Application>) => void
  reachedIndex?: number
}

function valueOf(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name)
  if (
    field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement ||
    field instanceof HTMLSelectElement
  ) {
    return field.value.trim()
  }

  return ''
}

export function EligibilityStepForm({
  application,
  readOnly,
  busy,
  onBack,
  onContinue,
  onSaveAndExit,
  onSelectStep,
  reachedIndex,
}: EligibilityStepFormProps) {
  return (
    <ApplicationWizard
      application={application}
      applicationId={application.id}
      backHref={onBack ? undefined : `${PORTAL_PATHS.application}/personal`}
      busy={busy}
      getData={(form) => {
        const citizenship = valueOf(form, 'usCitizenOrResident')
        return {
          yearsOfPractice: valueOf(form, 'yearsOfPractice'),
          trainingBackground: valueOf(form, 'trainingBackground'),
          primaryCraftDiscipline: valueOf(form, 'primaryCraftDiscipline'),
          usCitizenOrResident: citizenship === 'yes' || citizenship === 'no' ? citizenship : null,
        }
      }}
      nextHref={onContinue ? undefined : `${PORTAL_PATHS.application}/bio`}
      onBack={onBack}
      onContinue={onContinue}
      onSaveAndExit={onSaveAndExit}
      onSelectStep={onSelectStep}
      reachedIndex={reachedIndex}
      readOnly={readOnly}
      step="eligibility"
    >
      <Title as="h2">Eligibility confirmation</Title>
      <TextField
        defaultValue={application.yearsOfPractice ?? ''}
        label="Years of practice*"
        name="yearsOfPractice"
      />
      <TextArea
        defaultValue={application.trainingBackground ?? ''}
        label="Educational/training background*"
        name="trainingBackground"
      />
      <TextField
        defaultValue={application.primaryCraftDiscipline ?? ''}
        label="Primary craft discipline*"
        name="primaryCraftDiscipline"
      />
      <SelectField
        defaultValue={application.usCitizenOrResident ?? ''}
        label="Are you a United States citizen or resident?*"
        name="usCitizenOrResident"
        note="Selected applicants must be able to provide a complete and accurate IRS Form W-9 for tax reporting purposes."
      >
        <option value="">Select</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </SelectField>
    </ApplicationWizard>
  )
}
