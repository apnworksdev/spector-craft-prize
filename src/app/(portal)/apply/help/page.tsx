import { PortalShell } from '@/components/Portal/PortalShell'
import { Panel, Text, TextLink, Title } from '@/components/Portal/ui'
import { getApplicantSession } from '@/lib/portal-auth'
import { getAnyProgram } from '@/lib/portal-data'
import { displayName, PORTAL_PATHS, SUPPORT_EMAIL } from '@/lib/portal'

export default async function ApplyHelpPage() {
  const applicant = await getApplicantSession()
  const program = await getAnyProgram()

  return (
    <PortalShell
      showLogout={Boolean(applicant)}
      userLabel={applicant ? displayName(applicant) : undefined}
    >
      <Panel>
        <Title>Help</Title>
        <Text>{program?.helpMessage ?? 'Contact us for assistance.'}</Text>
        <TextLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</TextLink>
        {!applicant ? <TextLink href={PORTAL_PATHS.login}>Back to login</TextLink> : null}
      </Panel>
    </PortalShell>
  )
}
