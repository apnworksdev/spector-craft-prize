import { PortalShell } from '@/components/Portal/PortalShell'
import { Panel, Text, TextLink, Title } from '@/components/Portal/ui'
import { requireApplicant } from '@/lib/portal-auth'
import { getLiveProgram } from '@/lib/portal-data'
import { displayName, SUPPORT_EMAIL } from '@/lib/portal'

export default async function ApplyHelpPage() {
  const applicant = await requireApplicant()
  const program = await getLiveProgram()

  return (
    <PortalShell showLogout userLabel={displayName(applicant)}>
      <Panel>
        <Title>Help</Title>
        <Text>{program?.helpMessage ?? 'Contact us for assistance.'}</Text>
        <TextLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</TextLink>
      </Panel>
    </PortalShell>
  )
}
