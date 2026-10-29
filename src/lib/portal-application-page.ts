import { redirect } from 'next/navigation'

import { requireApplicant } from '@/lib/portal-auth'
import { isApplicationReadOnly, resolveApplicantPortal } from '@/lib/portal-data'
import { displayName, PORTAL_PATHS } from '@/lib/portal'
import { programAcceptsSubmissions } from '@/lib/program-deadline'

export async function loadApplicationWizardLayout() {
  const applicant = await requireApplicant()
  const { program, application } = await resolveApplicantPortal(applicant.id)

  if (!program?.id || !application) {
    redirect(PORTAL_PATHS.welcome)
  }

  const readOnly = isApplicationReadOnly(application)
  if (!readOnly && !programAcceptsSubmissions(program)) {
    redirect(PORTAL_PATHS.welcome)
  }

  return {
    applicant,
    application,
    program,
    readOnly,
    userLabel: displayName(applicant),
  }
}
