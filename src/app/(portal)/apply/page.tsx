import { redirect } from 'next/navigation'

import { AuthForms } from '@/components/Portal/AuthForms'
import { PortalShell } from '@/components/Portal/PortalShell'
import { getApplicantSession } from '@/lib/portal-auth'
import { PORTAL_PATHS } from '@/lib/portal'

export default async function ApplyLoginPage() {
  const user = await getApplicantSession()
  if (user) {
    redirect(PORTAL_PATHS.welcome)
  }

  return (
    <PortalShell>
      <AuthForms collection="applicants" mode="login" redirectTo={PORTAL_PATHS.welcome} />
    </PortalShell>
  )
}
