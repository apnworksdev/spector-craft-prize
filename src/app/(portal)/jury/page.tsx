import { redirect } from 'next/navigation'

import { isAdmin } from '@/access/roles'
import { PortalShell } from '@/components/Portal/PortalShell'
import { Panel, Stack, Text, TextLink, Title } from '@/components/Portal/ui'
import {
  juryScoreByApplication,
  programIdFromApplication,
  uniqueProgramsFromApplications,
} from '@/lib/jury-list'
import { displayName, PORTAL_PATHS, programJuryPath } from '@/lib/portal'
import { requireJuryAccess } from '@/lib/portal-auth'
import { getPayloadClient } from '@/lib/payload'

type PageProps = {
  searchParams: Promise<{ program?: string; q?: string; status?: string }>
}

export default async function JuryProgramPickerPage({ searchParams }: PageProps) {
  const user = await requireJuryAccess()
  const { program: programParam = '', q = '', status = '' } = await searchParams
  const payload = await getPayloadClient()
  const userRef = { ...user, collection: 'users' as const }

  const applications = await payload.find({
    collection: 'applications',
    where: isAdmin(user)
      ? { and: [{ status: { equals: 'submitted' } }, { selectedForEvaluation: { equals: true } }] }
      : undefined,
    depth: 1,
    limit: 500,
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
  const scoredIds = new Set(juryScoreByApplication(scored.docs).keys())
  const programs = uniqueProgramsFromApplications(applications.docs)

  // Legacy `/jury?program=1` → `/jury/scp26`
  const legacyProgramId = Number(programParam)
  if (legacyProgramId) {
    const legacyProgram =
      programs.find((program) => program.id === legacyProgramId) ??
      (await payload
        .findByID({
          collection: 'programs',
          id: legacyProgramId,
          depth: 0,
          user: userRef,
          overrideAccess: false,
        })
        .catch(() => null))
    if (legacyProgram) {
      redirect(
        programJuryPath(legacyProgram, {
          ...(q ? { q } : {}),
          ...(status && status !== 'all' ? { status } : {}),
        }),
      )
    }
  }

  if (programs.length === 1) {
    redirect(
      programJuryPath(programs[0], {
        ...(q ? { q } : {}),
        ...(status && status !== 'all' ? { status } : {}),
      }),
    )
  }

  return (
    <PortalShell
      logoutHref={`${PORTAL_PATHS.jury}/login`}
      showLogout
      title="Jury portal"
      userLabel={displayName(user)}
    >
      <Panel width="wide">
        <Title>Select a program</Title>
        <Text>Choose a program to review applications selected for evaluation.</Text>
        {programs.length === 0 ? (
          <Text>No applications are available for evaluation.</Text>
        ) : (
          <Stack as="ul">
            {programs.map((program) => {
              const count = applications.docs.filter(
                (application) => programIdFromApplication(application) === program.id,
              ).length
              const completed = applications.docs.filter(
                (application) =>
                  programIdFromApplication(application) === program.id &&
                  scoredIds.has(application.id),
              ).length

              return (
                <li key={program.id}>
                  <TextLink href={programJuryPath(program)}>
                    {program.code?.trim() ? `${program.code} · ` : ''}
                    {program.name}
                  </TextLink>
                  <Text variant="hint">
                    {completed} of {count} scored
                  </Text>
                </li>
              )
            })}
          </Stack>
        )}
      </Panel>
    </PortalShell>
  )
}
