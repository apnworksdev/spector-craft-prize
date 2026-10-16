import { ApplicationFlow } from '@/components/Portal/ApplicationFlow'
import { PortalShell } from '@/components/Portal/PortalShell'
import { loadApplicationWizardPage } from '@/lib/portal-application-page'

export default async function SubmitStepPage() {
  const { application, program, readOnly, userLabel } = await loadApplicationWizardPage('submit')

  return (
    <PortalShell showLogout userLabel={userLabel}>
      <ApplicationFlow
        application={application}
        initialStep="submit"
        program={program}
        readOnly={readOnly}
      />
    </PortalShell>
  )
}
