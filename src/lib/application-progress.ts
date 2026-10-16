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
