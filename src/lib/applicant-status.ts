import { applicationReadyToSubmit, stepComplete } from '@/lib/application-progress'
import type { Application } from '@/payload-types'

export type ApplicantBucket = 'completed' | 'in_progress' | 'not_started'

export function applicantBucket(application: Application | null | undefined): ApplicantBucket {
  if (!application) {
    return 'not_started'
  }

  if (application.status === 'submitted') {
    return 'completed'
  }

  if (
    stepComplete(application, 'personal') ||
    stepComplete(application, 'eligibility') ||
    stepComplete(application, 'bio') ||
    stepComplete(application, 'work') ||
    stepComplete(application, 'media') ||
    applicationReadyToSubmit(application)
  ) {
    return 'in_progress'
  }

  return 'not_started'
}
