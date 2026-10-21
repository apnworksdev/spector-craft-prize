import { redirect } from 'next/navigation'

import { AuthForms } from '@/components/Portal/AuthForms'
import { PortalShell } from '@/components/Portal/PortalShell'
import { Panel, Text, TextLink, Title } from '@/components/Portal/ui'
import { canAccessJuryView, isAdmin } from '@/access/roles'
import { getStaffSession } from '@/lib/portal-auth'
import { PORTAL_PATHS } from '@/lib/portal'

export default async function JuryLoginPage() {
  const user = await getStaffSession()
  if (user && canAccessJuryView(user)) {
    redirect(PORTAL_PATHS.jury)
  }

  if (user && isAdmin(user)) {
    return (
      <PortalShell logoutHref={`${PORTAL_PATHS.staff}/login`} showLogout title="Jury portal">
        <Panel>
          <Title>Jury access required</Title>
          <Text>
            Your admin account does not have jury access. Enable “Can jury” on your user in the CMS,
            or open the staff portal instead.
          </Text>
          <TextLink href={PORTAL_PATHS.staff}>Go to staff portal</TextLink>
        </Panel>
      </PortalShell>
    )
  }

  return (
    <PortalShell title="Jury portal">
      <AuthForms collection="users" mode="login" redirectTo={PORTAL_PATHS.jury} />
    </PortalShell>
  )
}
