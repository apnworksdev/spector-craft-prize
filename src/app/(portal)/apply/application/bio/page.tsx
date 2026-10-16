import { ApplicationFlow } from '@/components/Portal/ApplicationFlow'
import { PortalShell } from '@/components/Portal/PortalShell'
import { loadApplicationWizardPage } from '@/lib/portal-application-page'

export default async function BioStepPage() {
  const { application, program, readOnly, userLabel } = await loadApplicationWizardPage('bio')

  return (
    <PortalShell showLogout userLabel={userLabel}>
      <ApplicationFlow
        application={application}
        initialStep="bio"
        program={program}
        readOnly={readOnly}
      />
    </PortalShell>
  )
}
