'use client'

import { useState } from 'react'

import { ApplicationWizard } from '@/components/Portal/ApplicationWizard'
import { useWizardFieldError } from '@/components/Portal/WizardFieldErrors'
import type { FieldErrors } from '@/lib/application-validation'
import {
  OTHER_OPTION,
  PRIMARY_CRAFT_DISCIPLINE_OPTIONS,
  TRAINING_BACKGROUND_OPTIONS,
  YEARS_OF_PRACTICE_OPTIONS,
  resolveSelectWithOther,
  splitSelectWithOther,
} from '@/lib/eligibility-options'
import { PORTAL_PATHS, type WizardStep } from '@/lib/portal'
import type { Application } from '@/payload-types'

import { SelectField, TextArea, TextField, Title } from './ui'

type EligibilityStepFormProps = {
  application: Application
  readOnly: boolean
  busy?: boolean
  onBack?: (data: Partial<Application>) => void
  onContinue?: (data: Partial<Application>) => void
  onSaveAndExit?: (data: Partial<Application>) => void
  onSelectStep?: (step: WizardStep, data: Partial<Application>) => void
  initialFieldErrors?: FieldErrors
  focusToken?: number
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

function SelectWithOther({
  label,
  name,
  options,
  value,
  error,
  readOnly,
  otherLabel = 'Please specify*',
}: {
  label: string
  name: string
  options: readonly string[]
  value: string | null | undefined
  error?: string
  readOnly?: boolean
  otherLabel?: string
}) {
  const initial = splitSelectWithOther(value, options)
  const [choice, setChoice] = useState(initial.choice)
  const [other, setOther] = useState(initial.other)
  const showOther = choice === OTHER_OPTION

  return (
    <>
      <SelectField
        disabled={readOnly}
        error={showOther ? undefined : error}
        label={label}
        name={`${name}Choice`}
        onChange={(event) => setChoice(event.target.value)}
        value={choice}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value={OTHER_OPTION}>{OTHER_OPTION}</option>
      </SelectField>
      {showOther ? (
        <TextField
          error={error}
          label={otherLabel}
          name={`${name}Other`}
          onChange={(event) => setOther(event.target.value)}
          readOnly={readOnly}
          value={other}
        />
      ) : (
        <input name={`${name}Other`} type="hidden" value="" />
      )}
    </>
  )
}

function EligibilityFields({
  application,
  readOnly,
}: {
  application: Application
  readOnly: boolean
}) {
  const yearsError = useWizardFieldError('yearsOfPractice')
  const practiceBeganError = useWizardFieldError('practiceBegan')
  const trainingError = useWizardFieldError('trainingBackground')
  const disciplineError = useWizardFieldError('primaryCraftDiscipline')
  const citizenError = useWizardFieldError('usCitizenOrResident')

  return (
    <>
      <Title as="h2" caps>
        Eligibility confirmation
      </Title>
      <SelectField
        defaultValue={application.yearsOfPractice ?? ''}
        disabled={readOnly}
        error={yearsError}
        label="Years of practice*"
        name="yearsOfPractice"
      >
        <option value="">Select</option>
        {YEARS_OF_PRACTICE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </SelectField>
      <TextField
        defaultValue={application.practiceBegan ?? ''}
        error={practiceBeganError}
        label="State the month and year when your professional craft practice began*"
        name="practiceBegan"
        readOnly={readOnly}
      />
      <TextArea
        defaultValue={application.practiceBeganDetails ?? ''}
        label="If your professional practice began more than seven years ago (before February 2020) due to a significant life interruption or career shift, please explain these circumstances and provide a clear timeline of your practice."
        name="practiceBeganDetails"
        readOnly={readOnly}
      />
      <SelectWithOther
        error={trainingError}
        label="Educational/training background*"
        name="trainingBackground"
        options={TRAINING_BACKGROUND_OPTIONS}
        readOnly={readOnly}
        value={application.trainingBackground}
      />
      <SelectWithOther
        error={disciplineError}
        label="Primary craft discipline*"
        name="primaryCraftDiscipline"
        options={PRIMARY_CRAFT_DISCIPLINE_OPTIONS}
        readOnly={readOnly}
        value={application.primaryCraftDiscipline}
      />
      <SelectField
        defaultValue={application.usCitizenOrResident ?? ''}
        disabled={readOnly}
        error={citizenError}
        label="Are you a United States citizen or resident?*"
        name="usCitizenOrResident"
        note="Selected applicants must be able to provide a complete and accurate IRS Form W-9 for tax reporting purposes."
      >
        <option value="">Select</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </SelectField>
    </>
  )
}

export function EligibilityStepForm({
  application,
  readOnly,
  busy,
  onBack,
  onContinue,
  onSaveAndExit,
  onSelectStep,
  initialFieldErrors,
  focusToken,
}: EligibilityStepFormProps) {
  return (
    <ApplicationWizard
      application={application}
      applicationId={application.id}
      backHref={onBack ? undefined : `${PORTAL_PATHS.application}/personal`}
      busy={busy}
      focusToken={focusToken}
      getData={(form) => {
        const citizenship = valueOf(form, 'usCitizenOrResident')
        return {
          yearsOfPractice: valueOf(form, 'yearsOfPractice'),
          practiceBegan: valueOf(form, 'practiceBegan'),
          practiceBeganDetails: valueOf(form, 'practiceBeganDetails'),
          trainingBackground: resolveSelectWithOther(
            valueOf(form, 'trainingBackgroundChoice'),
            valueOf(form, 'trainingBackgroundOther'),
          ),
          primaryCraftDiscipline: resolveSelectWithOther(
            valueOf(form, 'primaryCraftDisciplineChoice'),
            valueOf(form, 'primaryCraftDisciplineOther'),
          ),
          usCitizenOrResident: citizenship === 'yes' || citizenship === 'no' ? citizenship : null,
        }
      }}
      initialFieldErrors={initialFieldErrors}
      nextHref={onContinue ? undefined : `${PORTAL_PATHS.application}/bio`}
      onBack={onBack}
      onContinue={onContinue}
      onSaveAndExit={onSaveAndExit}
      onSelectStep={onSelectStep}
      readOnly={readOnly}
      step="eligibility"
    >
      <EligibilityFields application={application} readOnly={readOnly} />
    </ApplicationWizard>
  )
}
