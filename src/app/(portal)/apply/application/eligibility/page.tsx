import { ApplicationFlow } from '@/components/Portal/ApplicationFlow'
import { PortalShell } from '@/components/Portal/PortalShell'
import { loadApplicationWizardPage } from '@/lib/portal-application-page'

export default async function EligibilityStepPage() {
  const { application, program, readOnly, userLabel } = await loadApplicationWizardPage('eligibility')

  return (
    <PortalShell showLogout userLabel={userLabel}>
      <ApplicationFlow
        application={application}
        initialStep="eligibility"
        program={program}
        readOnly={readOnly}
      />
    </PortalShell>
  )
}
