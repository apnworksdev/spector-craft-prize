import { isMediaComplete, isSubmitComplete } from '@/lib/application-progress'
import {
  ADDITIONAL_DETAILS_MAX_WORDS,
  ARTIST_STATEMENT_MAX_WORDS,
  BIO_SUMMARY_MAX_WORDS,
  WHY_PRIZE_MAX_WORDS,
  WORK_DESCRIPTION_MAX_WORDS,
  WORK_SIGNIFICANCE_MAX_WORDS,
} from '@/lib/portal-media'
import { WIZARD_STEPS, type WizardStep } from '@/lib/portal'
import { wordCountError } from '@/lib/word-count'
import type { Application, Program } from '@/payload-types'

export type FieldErrors = Record<string, string>

const REQUIRED = 'This field is required.'

function filled(value: unknown): boolean {
  return Boolean(typeof value === 'string' ? value.trim() : value)
}

function requireText(errors: FieldErrors, value: unknown, field: string) {
  if (!filled(value)) {
    errors[field] = REQUIRED
  }
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidOptionalUrl(value: string): boolean {
  if (!value.trim()) {
    return true
  }

  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`)
    return Boolean(url.hostname.includes('.'))
  } catch {
    return false
  }
}

function isValidDateNotFuture(value: string): boolean {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return false
  }

  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return date <= today
}

function wordLimit(errors: FieldErrors, value: unknown, field: string, maxWords: number) {
  const result = wordCountError(typeof value === 'string' ? value : undefined, maxWords)
  if (result !== true) {
    errors[field] = result
  }
}

export function mergeApplication(
  application: Application,
  data: Partial<Application>,
): Application {
  return { ...application, ...data }
}

export function validateWizardStep(
  step: WizardStep,
  application: Application,
  context?: {
    program?: Program
    requireGovernmentId?: boolean
    /** When false, skip required-field checks so applicants can continue incomplete sections. */
    requireComplete?: boolean
  },
): FieldErrors {
  const errors: FieldErrors = {}
  const requireComplete = context?.requireComplete !== false

  if (step === 'personal') {
    if (requireComplete) {
      requireText(errors, application.fullName, 'fullName')
      requireText(errors, application.dateOfBirth, 'dateOfBirth')
      requireText(errors, application.addressLine1, 'addressLine1')
      requireText(errors, application.city, 'city')
      requireText(errors, application.state, 'state')
      requireText(errors, application.postalCode, 'postalCode')
      requireText(errors, application.country, 'country')
      requireText(errors, application.phone, 'phone')
      requireText(errors, application.email, 'email')
    }
    if (application.dateOfBirth && !isValidDateNotFuture(application.dateOfBirth.slice(0, 10))) {
      errors.dateOfBirth = 'Enter a valid date of birth.'
    }
    if (application.email && !isEmail(application.email.trim())) {
      errors.email = 'Enter a valid email address.'
    }
    if (application.website && !isValidOptionalUrl(application.website)) {
      errors.website = 'Enter a valid URL.'
    }
  }

  if (step === 'eligibility') {
    if (requireComplete) {
      requireText(errors, application.yearsOfPractice, 'yearsOfPractice')
      requireText(errors, application.trainingBackground, 'trainingBackground')
      requireText(errors, application.primaryCraftDiscipline, 'primaryCraftDiscipline')
      if (
        application.usCitizenOrResident !== 'yes' &&
        application.usCitizenOrResident !== 'no'
      ) {
        errors.usCitizenOrResident = REQUIRED
      }
    }
  }

  if (step === 'bio') {
    if (requireComplete) {
      requireText(errors, application.educationalBackground, 'educationalBackground')
      requireText(errors, application.biographicalSummary, 'biographicalSummary')
    }
    wordLimit(errors, application.biographicalSummary, 'biographicalSummary', BIO_SUMMARY_MAX_WORDS)
  }

  if (step === 'work') {
    if (requireComplete) {
      requireText(errors, application.workTitle, 'workTitle')
      requireText(errors, application.workYearCreated, 'workYearCreated')
      requireText(errors, application.workDimensions, 'workDimensions')
      requireText(errors, application.workMaterials, 'workMaterials')
      requireText(errors, application.artistStatement, 'artistStatement')
      requireText(errors, application.workDescription, 'workDescription')
      requireText(errors, application.workSignificance, 'workSignificance')
      requireText(errors, application.whyPrize, 'whyPrize')
    }
    wordLimit(errors, application.artistStatement, 'artistStatement', ARTIST_STATEMENT_MAX_WORDS)
    wordLimit(errors, application.workDescription, 'workDescription', WORK_DESCRIPTION_MAX_WORDS)
    wordLimit(errors, application.workSignificance, 'workSignificance', WORK_SIGNIFICANCE_MAX_WORDS)
    wordLimit(errors, application.whyPrize, 'whyPrize', WHY_PRIZE_MAX_WORDS)
  }

  if (step === 'media' && requireComplete && !isMediaComplete(application)) {
    errors.workImages =
      'Add at least one complete set of work images with title, year, materials, and dimensions.'
  }

  if (step === 'submit') {
    const declarations = context?.program?.declarations ?? []
    const accepted = application.declarationsAccepted ?? []
    declarations.forEach((_, index) => {
      if (!accepted[index]?.accepted) {
        errors[`declaration_${index}`] = 'Accept this declaration to continue.'
      }
    })
    if (context?.requireGovernmentId && !application.governmentId) {
      errors.governmentId = 'A government-issued ID is required.'
    }
  }

  return errors
}

export function validateSubmitReady(
  application: Application,
  program: Program,
): FieldErrors {
  const errors: FieldErrors = {}

  for (const step of WIZARD_STEPS) {
    Object.assign(
      errors,
      validateWizardStep(step, application, {
        program,
        requireGovernmentId: step === 'submit',
        requireComplete: true,
      }),
    )
  }

  if (!isSubmitComplete(application) && !application.governmentId && !errors.governmentId) {
    errors.governmentId = 'A government-issued ID is required.'
  }

  return errors
}

const FIELD_STEP: Record<string, WizardStep> = {
  fullName: 'personal',
  dateOfBirth: 'personal',
  addressLine1: 'personal',
  city: 'personal',
  state: 'personal',
  postalCode: 'personal',
  country: 'personal',
  phone: 'personal',
  email: 'personal',
  website: 'personal',
  yearsOfPractice: 'eligibility',
  trainingBackground: 'eligibility',
  primaryCraftDiscipline: 'eligibility',
  usCitizenOrResident: 'eligibility',
  educationalBackground: 'bio',
  biographicalSummary: 'bio',
  workTitle: 'work',
  workYearCreated: 'work',
  workDimensions: 'work',
  workMaterials: 'work',
  artistStatement: 'work',
  workDescription: 'work',
  workSignificance: 'work',
  whyPrize: 'work',
  workImages: 'media',
  governmentId: 'submit',
}

export function wizardStepForField(field: string): WizardStep {
  if (field.startsWith('declaration_')) {
    return 'submit'
  }

  return FIELD_STEP[field] ?? 'submit'
}

export function firstInvalidField(errors: FieldErrors): string | null {
  return Object.keys(errors)[0] ?? null
}

export function focusFirstInvalidField(errors: FieldErrors) {
  const field = firstInvalidField(errors)
  if (!field) {
    return
  }

  const element =
    document.getElementById(field) ??
    (document.querySelector(`[name="${field}"]`) as HTMLElement | null) ??
    (document.querySelector(`[name="${field}Choice"]`) as HTMLElement | null)

  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
