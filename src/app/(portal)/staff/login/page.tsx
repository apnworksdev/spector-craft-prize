import { redirect } from 'next/navigation'

import { AuthForms } from '@/components/Portal/AuthForms'
import { PortalShell } from '@/components/Portal/PortalShell'
import { canAccessJuryView, isAdmin } from '@/access/roles'
import { getStaffSession } from '@/lib/portal-auth'
import { PORTAL_PATHS } from '@/lib/portal'

export default async function StaffLoginPage() {
  const user = await getStaffSession()
  if (user && isAdmin(user)) {
    redirect(PORTAL_PATHS.staff)
  }
  if (user && canAccessJuryView(user)) {
    redirect(PORTAL_PATHS.jury)
  }

  return (
    <PortalShell title="Staff portal">
      <AuthForms collection="users" mode="login" redirectTo={PORTAL_PATHS.staff} />
    </PortalShell>
  )
}
