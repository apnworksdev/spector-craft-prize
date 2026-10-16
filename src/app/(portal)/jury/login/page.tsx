import { redirect } from 'next/navigation'

import { AuthForms } from '@/components/Portal/AuthForms'
import { PortalShell } from '@/components/Portal/PortalShell'
import { canAccessJuryView } from '@/access/roles'
import { getStaffSession } from '@/lib/portal-auth'
import { PORTAL_PATHS } from '@/lib/portal'

export default async function JuryLoginPage() {
  const user = await getStaffSession()
  if (user && canAccessJuryView(user)) {
    redirect(PORTAL_PATHS.jury)
  }

  return (
    <PortalShell title="Jury portal">
      <AuthForms collection="users" mode="login" redirectTo={PORTAL_PATHS.jury} />
    </PortalShell>
  )
}
