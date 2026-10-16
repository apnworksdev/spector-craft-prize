import { ApplicationFlow } from '@/components/Portal/ApplicationFlow'
import { PortalShell } from '@/components/Portal/PortalShell'
import { loadApplicationWizardPage } from '@/lib/portal-application-page'

export default async function PersonalStepPage() {
  const { application, program, readOnly, userLabel } = await loadApplicationWizardPage('personal')

  return (
    <PortalShell showLogout userLabel={userLabel}>
      <ApplicationFlow
        application={application}
        initialStep="personal"
        program={program}
        readOnly={readOnly}
      />
    </PortalShell>
  )
}
