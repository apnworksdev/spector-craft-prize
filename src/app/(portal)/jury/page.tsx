import { isAdmin } from '@/access/roles'
import { PortalShell } from '@/components/Portal/PortalShell'
import { Actions, Button, Input, Panel, Stack, Text, TextLink, Title } from '@/components/Portal/ui'
import { applicationLabel, displayName, PORTAL_PATHS } from '@/lib/portal'
import { requireJuryAccess } from '@/lib/portal-auth'
import { getPayloadClient } from '@/lib/payload'

type PageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function JuryListPage({ searchParams }: PageProps) {
  const user = await requireJuryAccess()
  const { q = '' } = await searchParams
  const query = q.trim().toLowerCase()
  const payload = await getPayloadClient()

  const userRef = { ...user, collection: 'users' as const }
  const applications = await payload.find({
    collection: 'applications',
    where: isAdmin(user)
      ? { and: [{ status: { equals: 'submitted' } }, { selectedForEvaluation: { equals: true } }] }
      : undefined,
    depth: 1,
    limit: 200,
    user: userRef,
    overrideAccess: false,
  })
  const scored = await payload.find({
    collection: 'evaluations',
    where: { juror: { equals: user.id } },
    limit: 500,
    depth: 0,
    user: userRef,
    overrideAccess: false,
  })
  const scoredIds = new Set(
    scored.docs.map((evaluation) =>
      typeof evaluation.application === 'object' ? evaluation.application.id : evaluation.application,
    ),
  )

  const visible = applications.docs.filter((application) => {
    if (!query) {
      return true
    }

    return applicationLabel(application).toLowerCase().includes(query)
  })

  return (
    <PortalShell
      logoutHref={`${PORTAL_PATHS.jury}/login`}
      showLogout
      title="Jury portal"
      userLabel={displayName(user)}
    >
      <Panel width="wide">
        <Title>Applications selected for evaluation</Title>
        <Actions action={PORTAL_PATHS.jury} as="form">
          <Input
            aria-label="Search applications"
            defaultValue={q}
            name="q"
            placeholder="Search"
            type="search"
          />
          <Button type="submit">Search</Button>
        </Actions>
        {visible.length === 0 ? (
          <Text>No applications.</Text>
        ) : (
          <Stack as="ul">
            {visible.map((application) => (
              <li key={application.id}>
                <TextLink href={`${PORTAL_PATHS.jury}/${application.id}`}>
                  {applicationLabel(application)}
                  {scoredIds.has(application.id) ? ' · Scored' : ''}
                </TextLink>
              </li>
            ))}
          </Stack>
        )}
      </Panel>
    </PortalShell>
  )
}
