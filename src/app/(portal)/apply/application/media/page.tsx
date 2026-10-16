import { ApplicationFlow } from '@/components/Portal/ApplicationFlow'
import { PortalShell } from '@/components/Portal/PortalShell'
import { loadApplicationWizardPage } from '@/lib/portal-application-page'

export default async function MediaStepPage() {
  const { application, program, readOnly, userLabel } = await loadApplicationWizardPage('media')

  return (
    <PortalShell showLogout userLabel={userLabel}>
      <ApplicationFlow
        application={application}
        initialStep="media"
        program={program}
        readOnly={readOnly}
      />
    </PortalShell>
  )
}
