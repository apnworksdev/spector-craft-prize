'use client'

import { ApplicationWizard } from '@/components/Portal/ApplicationWizard'
import { PORTAL_PATHS, type WizardStep } from '@/lib/portal'
import type { Application } from '@/payload-types'

import { FieldRow, TextField, Title } from './ui'

type PersonalStepFormProps = {
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
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    return field.value.trim()
  }

  return ''
}

function dateValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : ''
}

export function PersonalStepForm({
  application,
  readOnly,
  busy,
  onBack,
  onContinue,
  onSaveAndExit,
  onSelectStep,
  reachedIndex,
}: PersonalStepFormProps) {
  return (
    <ApplicationWizard
      application={application}
      applicationId={application.id}
      busy={busy}
      getData={(form) => ({
        fullName: valueOf(form, 'fullName'),
        artistName: valueOf(form, 'artistName'),
        dateOfBirth: valueOf(form, 'dateOfBirth'),
        addressLine1: valueOf(form, 'addressLine1'),
        addressLine2: valueOf(form, 'addressLine2'),
        city: valueOf(form, 'city'),
        state: valueOf(form, 'state'),
        postalCode: valueOf(form, 'postalCode'),
        country: valueOf(form, 'country'),
        phone: valueOf(form, 'phone'),
        email: valueOf(form, 'email'),
        website: valueOf(form, 'website'),
        socialMedia: valueOf(form, 'socialMedia'),
      })}
      nextHref={onContinue ? undefined : `${PORTAL_PATHS.application}/eligibility`}
      onBack={onBack}
      onContinue={onContinue}
      onSaveAndExit={onSaveAndExit}
      onSelectStep={onSelectStep}
      reachedIndex={reachedIndex}
      readOnly={readOnly}
      step="personal"
    >
      <Title as="h2">Personal information</Title>
      <FieldRow>
        <TextField defaultValue={application.fullName ?? ''} label="Full name*" name="fullName" />
        <TextField
          defaultValue={application.artistName ?? ''}
          label="Artist name (if different from full name)"
          name="artistName"
        />
      </FieldRow>
      <TextField
        defaultValue={dateValue(application.dateOfBirth)}
        label="Date of birth*"
        name="dateOfBirth"
        type="date"
      />
      <FieldRow>
        <TextField
          defaultValue={application.addressLine1 ?? ''}
          label="Address line 1*"
          name="addressLine1"
        />
        <TextField
          defaultValue={application.addressLine2 ?? ''}
          label="Address line 2"
          name="addressLine2"
        />
      </FieldRow>
      <FieldRow>
        <TextField defaultValue={application.city ?? ''} label="City*" name="city" />
        <TextField defaultValue={application.state ?? ''} label="State*" name="state" />
      </FieldRow>
      <FieldRow>
        <TextField
          defaultValue={application.postalCode ?? ''}
          label="Postal/zip code*"
          name="postalCode"
        />
        <TextField defaultValue={application.country ?? ''} label="Country*" name="country" />
      </FieldRow>
      <FieldRow>
        <TextField defaultValue={application.phone ?? ''} label="Phone*" name="phone" />
        <TextField
          defaultValue={application.email ?? ''}
          label="Email*"
          name="email"
          type="email"
        />
      </FieldRow>
      <FieldRow>
        <TextField
          defaultValue={application.website ?? ''}
          label="Website/portfolio URL"
          name="website"
        />
        <TextField
          defaultValue={application.socialMedia ?? ''}
          label="Social media"
          name="socialMedia"
        />
      </FieldRow>
    </ApplicationWizard>
  )
}
