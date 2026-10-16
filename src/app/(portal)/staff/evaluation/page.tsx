import { PortalShell } from '@/components/Portal/PortalShell'
import { StaffNav } from '@/components/Portal/StaffNav'
import { Panel, Stack, Text, TextLink, Title } from '@/components/Portal/ui'
import { applicationLabel, displayName, PORTAL_PATHS } from '@/lib/portal'
import { requireAdmin } from '@/lib/portal-auth'
import { getPayloadClient } from '@/lib/payload'

export default async function StaffEvaluationPage() {
  const user = await requireAdmin()

  const payload = await getPayloadClient()
  const applications = await payload.find({
    collection: 'applications',
    where: {
      selectedForEvaluation: {
        equals: true,
      },
    },
    depth: 1,
    limit: 200,
    user: { ...user, collection: 'users' },
  })

  return (
    <PortalShell
      logoutHref={`${PORTAL_PATHS.staff}/login`}
      showLogout
      title="Staff portal"
      userLabel={displayName(user)}
    >
      <Panel width="wide">
        <StaffNav user={user} />
        <Title>Applications selected for evaluation</Title>
        {applications.docs.length === 0 ? (
          <Text>No applications.</Text>
        ) : (
          <Stack as="ul">
            {applications.docs.map((application) => (
              <li key={application.id}>
                <TextLink href={`${PORTAL_PATHS.staffApplicants}/${application.id}`}>
                  {applicationLabel(application)}
                </TextLink>
              </li>
            ))}
          </Stack>
        )}
      </Panel>
    </PortalShell>
  )
}
