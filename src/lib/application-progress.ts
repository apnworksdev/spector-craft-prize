import type { Application } from '@/payload-types'
import type { WizardStep } from '@/lib/portal'

function filled(value: string | null | undefined): boolean {
  return Boolean(value?.trim())
}

export function isPersonalComplete(application: Application): boolean {
  return (
    filled(application.fullName) &&
    filled(application.dateOfBirth) &&
    filled(application.addressLine1) &&
    filled(application.city) &&
    filled(application.state) &&
    filled(application.postalCode) &&
    filled(application.country) &&
    filled(application.phone) &&
    filled(application.email)
  )
}

export function isEligibilityComplete(application: Application): boolean {
  return (
    filled(application.yearsOfPractice) &&
    filled(application.trainingBackground) &&
    filled(application.primaryCraftDiscipline) &&
    (application.usCitizenOrResident === 'yes' || application.usCitizenOrResident === 'no')
  )
}

export function isBioComplete(application: Application): boolean {
  return Boolean(
    application.educationalBackground?.trim() && application.biographicalSummary?.trim(),
  )
}

export function isWorkComplete(application: Application): boolean {
  return (
    filled(application.workTitle) &&
    filled(application.workYearCreated) &&
    filled(application.workDimensions) &&
    filled(application.workMaterials) &&
    filled(application.artistStatement) &&
    filled(application.workDescription) &&
    filled(application.workSignificance) &&
    filled(application.whyPrize)
  )
}

function imageEntryComplete(entry: NonNullable<Application['workImages']>[number]): boolean {
  return Boolean(
    entry?.file &&
    entry.title?.trim() &&
    entry.yearCreated?.trim() &&
    entry.materials?.trim() &&
    entry.dimensions?.trim(),
  )
}

export function isMediaComplete(application: Application): boolean {
  const images = application.workImages ?? []
  if (images.length < 1) {
    return false
  }

  return images.every((entry) => imageEntryComplete(entry))
}

export function isSubmitComplete(application: Application): boolean {
  const declarations = application.declarationsAccepted ?? []
  const allAccepted = declarations.length > 0 && declarations.every((entry) => entry?.accepted)
  return allAccepted && Boolean(application.governmentId)
}

export function stepComplete(application: Application, step: WizardStep): boolean {
  switch (step) {
    case 'personal':
      return isPersonalComplete(application)
    case 'eligibility':
      return isEligibilityComplete(application)
    case 'bio':
      return isBioComplete(application)
    case 'work':
      return isWorkComplete(application)
    case 'media':
      return isMediaComplete(application)
    case 'submit':
      return isSubmitComplete(application)
    default:
      return false
  }
}

export function furthestAllowedStep(application: Application): WizardStep {
  if (!isPersonalComplete(application)) {
    return 'personal'
  }

  if (!isEligibilityComplete(application)) {
    return 'eligibility'
  }

  if (!isBioComplete(application)) {
    return 'bio'
  }

  if (!isWorkComplete(application)) {
    return 'work'
  }

  if (!isMediaComplete(application)) {
    return 'media'
  }

  return 'submit'
}

export function canOpenStep(application: Application, step: WizardStep): boolean {
  const order: WizardStep[] = ['personal', 'eligibility', 'bio', 'work', 'media', 'submit']
  const allowed = furthestAllowedStep(application)
  return order.indexOf(step) <= order.indexOf(allowed)
}

export function applicationSectionsComplete(application: Application): boolean {
  return (
    isPersonalComplete(application) &&
    isEligibilityComplete(application) &&
    isBioComplete(application) &&
    isWorkComplete(application) &&
    isMediaComplete(application)
  )
}

export function applicationReadyToSubmit(application: Application): boolean {
  return applicationSectionsComplete(application) && isSubmitComplete(application)
}

export const APPLICATION_PROGRESS_TOTAL = 25

function countTrue(values: boolean[]): number {
  return values.filter(Boolean).length
}

export function applicationProgressChecks(application: Application): number {
  if (application.status === 'submitted') {
    return APPLICATION_PROGRESS_TOTAL
  }

  const declarations = application.declarationsAccepted ?? []
  const declarationsDone =
    declarations.length > 0 && declarations.every((entry) => entry?.accepted)

  return countTrue([
    filled(application.fullName),
    filled(application.dateOfBirth),
    filled(application.addressLine1),
    filled(application.city),
    filled(application.state),
    filled(application.postalCode),
    filled(application.country),
    filled(application.phone),
    filled(application.email),
    filled(application.yearsOfPractice),
    filled(application.trainingBackground),
    filled(application.primaryCraftDiscipline),
    application.usCitizenOrResident === 'yes' || application.usCitizenOrResident === 'no',
    filled(application.educationalBackground),
    filled(application.biographicalSummary),
    filled(application.workTitle),
    filled(application.workYearCreated),
    filled(application.workDimensions),
    filled(application.workMaterials),
    filled(application.artistStatement),
    filled(application.workDescription),
    filled(application.workSignificance),
    filled(application.whyPrize),
    isMediaComplete(application),
    declarationsDone,
    Boolean(application.governmentId),
  ])
}

export function applicationProgressPercent(application: Application): number {
  const checks = applicationProgressChecks(application)
  return Math.round((checks / APPLICATION_PROGRESS_TOTAL) * 100)
}

export function applicationHasStarted(application: Application): boolean {
  return applicationProgressChecks(application) > 0
}

export function stepFillRatio(application: Application, step: WizardStep): number {
  if (application.status === 'submitted') {
    return 1
  }

  switch (step) {
    case 'personal':
      return ratio(
        countTrue([
          filled(application.fullName),
          filled(application.dateOfBirth),
          filled(application.addressLine1),
          filled(application.city),
          filled(application.state),
          filled(application.postalCode),
          filled(application.country),
          filled(application.phone),
          filled(application.email),
        ]),
        9,
      )
    case 'eligibility':
      return ratio(
        countTrue([
          filled(application.yearsOfPractice),
          filled(application.trainingBackground),
          filled(application.primaryCraftDiscipline),
          application.usCitizenOrResident === 'yes' || application.usCitizenOrResident === 'no',
        ]),
        4,
      )
    case 'bio':
      return ratio(
        countTrue([
          filled(application.educationalBackground),
          filled(application.biographicalSummary),
        ]),
        2,
      )
    case 'work':
      return ratio(
        countTrue([
          filled(application.workTitle),
          filled(application.workYearCreated),
          filled(application.workDimensions),
          filled(application.workMaterials),
          filled(application.artistStatement),
          filled(application.workDescription),
          filled(application.workSignificance),
          filled(application.whyPrize),
        ]),
        8,
      )
    case 'media': {
      const images = application.workImages ?? []
      if (images.length === 0) {
        return 0
      }

      const checks = images.flatMap((entry) => [
        Boolean(entry?.file),
        filled(entry?.title),
        filled(entry?.yearCreated),
        filled(entry?.materials),
        filled(entry?.dimensions),
      ])
      return ratio(countTrue(checks), checks.length)
    }
    case 'submit': {
      const declarations = application.declarationsAccepted ?? []
      const accepted = declarations.filter((entry) => entry?.accepted).length
      const declarationRatio = declarations.length === 0 ? 0 : accepted / declarations.length
      return (declarationRatio + (application.governmentId ? 1 : 0)) / 2
    }
    default:
      return 0
  }
}

const FORM_FILL_WEIGHTS = {
  personal: 9,
  eligibility: 4,
  bio: 2,
  work: 8,
} as const

export function formsFillRatio(application: Application): number {
  if (application.status === 'submitted') {
    return 1
  }

  const total = Object.values(FORM_FILL_WEIGHTS).reduce((sum, weight) => sum + weight, 0)
  const filledWeight = (Object.keys(FORM_FILL_WEIGHTS) as Array<keyof typeof FORM_FILL_WEIGHTS>).reduce(
    (sum, step) => sum + stepFillRatio(application, step) * FORM_FILL_WEIGHTS[step],
    0,
  )

  return ratio(filledWeight, total)
}

function ratio(done: number, total: number): number {
  if (total <= 0) {
    return 0
  }

  return Math.min(1, Math.max(0, done / total))
}
