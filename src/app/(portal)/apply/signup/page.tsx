import { PortalShell } from '@/components/Portal/PortalShell'
import { AuthForms } from '@/components/Portal/AuthForms'
import { Panel, Text, Title } from '@/components/Portal/ui'
import { getLiveProgram } from '@/lib/portal-data'
import { PORTAL_PATHS } from '@/lib/portal'

export default async function ApplySignupPage() {
  const program = await getLiveProgram()

  return (
    <PortalShell>
      {program?.status !== 'live' ? (
        <Panel>
          <Title>Sign up</Title>
          <Text>Applications are not open yet. Please check back later.</Text>
        </Panel>
      ) : (
        <AuthForms collection="applicants" mode="signup" redirectTo={PORTAL_PATHS.welcome} />
      )}
    </PortalShell>
  )
}
