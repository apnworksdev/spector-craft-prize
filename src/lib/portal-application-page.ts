import { redirect } from 'next/navigation'

import { canOpenStep } from '@/lib/application-progress'
import { requireApplicant } from '@/lib/portal-auth'
import {
  ensureApplicantApplication,
  getLiveProgram,
  isApplicationReadOnly,
} from '@/lib/portal-data'
import { displayName, PORTAL_PATHS, type WizardStep } from '@/lib/portal'

export async function loadApplicationWizardPage(step: WizardStep) {
  const applicant = await requireApplicant()
  const program = await getLiveProgram()

  if (!program?.id) {
    redirect(PORTAL_PATHS.welcome)
  }

  const application = await ensureApplicantApplication(applicant.id, program.id)

  if (!canOpenStep(application, step)) {
    redirect(`${PORTAL_PATHS.application}/personal`)
  }

  return {
    applicant,
    application,
    program,
    readOnly: isApplicationReadOnly(application),
    userLabel: displayName(applicant),
  }
}
