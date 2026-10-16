import { ApplicationFlow } from '@/components/Portal/ApplicationFlow'
import { PortalShell } from '@/components/Portal/PortalShell'
import { loadApplicationWizardPage } from '@/lib/portal-application-page'

export default async function WorkStepPage() {
  const { application, program, readOnly, userLabel } = await loadApplicationWizardPage('work')

  return (
    <PortalShell showLogout userLabel={userLabel}>
      <ApplicationFlow
        application={application}
        initialStep="work"
        program={program}
        readOnly={readOnly}
      />
    </PortalShell>
  )
}
