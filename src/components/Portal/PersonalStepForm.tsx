'use client'

import { useId } from 'react'

import { ApplicationWizard } from '@/components/Portal/ApplicationWizard'
import { useWizardFieldError } from '@/components/Portal/WizardFieldErrors'
import { countryNameSuggestions } from '@/lib/countries'
import { PORTAL_PATHS, type WizardStep } from '@/lib/portal'
import type { Application } from '@/payload-types'

import { FieldRow, TextField, Title } from './ui'

type PersonalStepFormProps = {
  application: Application
  readOnly: boolean
  busy?: boolean
  onBack?: (data: Partial<Application>) => void
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

function PersonalFields({ application, readOnly }: { application: Application; readOnly: boolean }) {
  const countryListId = useId()
  const countries = countryNameSuggestions()
  const fullNameError = useWizardFieldError('fullName')
  const dateOfBirthError = useWizardFieldError('dateOfBirth')
  const addressLine1Error = useWizardFieldError('addressLine1')
  const cityError = useWizardFieldError('city')
  const stateError = useWizardFieldError('state')
  const postalCodeError = useWizardFieldError('postalCode')
  const countryError = useWizardFieldError('country')
  const phoneError = useWizardFieldError('phone')
  const emailError = useWizardFieldError('email')
  const websiteError = useWizardFieldError('website')

  return (
    <>
      <Title as="h2" caps>
        Personal information
      </Title>
      <FieldRow>
        <TextField
          autoComplete="name"
          defaultValue={application.fullName ?? ''}
          error={fullNameError}
          label="Full name*"
          name="fullName"
          readOnly={readOnly}
        />
        <TextField
          autoComplete="nickname"
          defaultValue={application.artistName ?? ''}
          label="Artist name (if different from full name)"
          name="artistName"
          readOnly={readOnly}
        />
      </FieldRow>
      <TextField
        autoComplete="bday"
        defaultValue={dateValue(application.dateOfBirth)}
        error={dateOfBirthError}
        label="Date of birth*"
        name="dateOfBirth"
        readOnly={readOnly}
        type="date"
      />
      <FieldRow>
        <TextField
          autoComplete="address-line1"
          defaultValue={application.addressLine1 ?? ''}
          error={addressLine1Error}
          label="Address line 1*"
          name="addressLine1"
          readOnly={readOnly}
        />
        <TextField
          autoComplete="address-line2"
          defaultValue={application.addressLine2 ?? ''}
          label="Address line 2"
          name="addressLine2"
          readOnly={readOnly}
        />
      </FieldRow>
      <FieldRow>
        <TextField
          autoComplete="address-level2"
          defaultValue={application.city ?? ''}
          error={cityError}
          label="City*"
          name="city"
          readOnly={readOnly}
        />
        <TextField
          autoComplete="address-level1"
          defaultValue={application.state ?? ''}
          error={stateError}
          label="State*"
          name="state"
          readOnly={readOnly}
        />
      </FieldRow>
      <FieldRow>
        <TextField
          autoComplete="postal-code"
          defaultValue={application.postalCode ?? ''}
          error={postalCodeError}
          label="Postal/zip code*"
          name="postalCode"
          readOnly={readOnly}
        />
        <TextField
          autoComplete="country-name"
          defaultValue={application.country ?? ''}
          error={countryError}
          label="Country*"
          list={countryListId}
          name="country"
          readOnly={readOnly}
        />
      </FieldRow>
      <datalist id={countryListId}>
        {countries.map((country) => (
          <option key={country} value={country} />
        ))}
      </datalist>
      <FieldRow>
        <TextField
          autoComplete="tel"
          defaultValue={application.phone ?? ''}
          error={phoneError}
          label="Phone*"
          name="phone"
          readOnly={readOnly}
          type="tel"
        />
        <TextField
          autoComplete="email"
          defaultValue={application.email ?? ''}
          error={emailError}
          label="Email*"
          name="email"
          readOnly={readOnly}
          type="email"
        />
      </FieldRow>
      <FieldRow>
        <TextField
          autoComplete="url"
          defaultValue={application.website ?? ''}
          error={websiteError}
          label="Website/portfolio URL"
          name="website"
          readOnly={readOnly}
        />
        <TextField
          defaultValue={application.socialMedia ?? ''}
          label="Social media"
          name="socialMedia"
          readOnly={readOnly}
        />
      </FieldRow>
    </>
  )
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
      <PersonalFields application={application} readOnly={readOnly} />
    </ApplicationWizard>
  )
}
