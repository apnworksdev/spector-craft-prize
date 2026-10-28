import { notFound, redirect } from 'next/navigation'

import { isAdmin } from '@/access/roles'
import { PortalShell } from '@/components/Portal/PortalShell'
import {
  Actions,
  Button,
  Input,
  Panel,
  Select,
  Stack,
  StatusBadge,
  Table,
  Text,
  TextLink,
  Title,
} from '@/components/Portal/ui'
import {
  juryScoreByApplication,
  parseJuryStatusFilter,
  partitionJuryApplications,
  programIdFromApplication,
  uniqueProgramsFromApplications,
} from '@/lib/jury-list'
import {
  applicationJuryPath,
  applicationLabel,
  displayName,
  PORTAL_PATHS,
  programCodeForDownload,
  programJuryPath,
} from '@/lib/portal'
import { requireJuryAccess } from '@/lib/portal-auth'
import { getPayloadClient } from '@/lib/payload'
import type { Program } from '@/payload-types'

import { redirectLegacyJuryApplication } from './legacy-application-redirect'

type PageProps = {
  params: Promise<{ programCode: string }>
  searchParams: Promise<{ q?: string; status?: string; view?: string; program?: string }>
}

export default async function JuryProgramPage({ params, searchParams }: PageProps) {
  const user = await requireJuryAccess()
  const { programCode } = await params
  const { q = '', status: statusParam = '', view, program: legacyProgram } = await searchParams

  // Legacy `/jury/:numericId` used to be an application page.
  if (/^\d+$/.test(programCode)) {
    await redirectLegacyJuryApplication(user, Number(programCode), { view, program: legacyProgram })
  }

  const query = q.trim().toLowerCase()
  const statusFilter = parseJuryStatusFilter(statusParam)
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
  const scoreByApplication = juryScoreByApplication(scored.docs)
  const scoredIds = new Set(scoreByApplication.keys())
  const programs = uniqueProgramsFromApplications(applications.docs)

  let selectedProgram: Program | null =
    programs.find(
      (program) => programCodeForDownload(program).toLowerCase() === programCode.toLowerCase(),
    ) ?? null

  if (!selectedProgram) {
    const byCode = await payload.find({
      collection: 'programs',
      where: {
        or: [
          { code: { equals: programCode.toUpperCase() } },
          { code: { equals: programCode } },
          { code: { equals: programCode.toLowerCase() } },
        ],
      },
      limit: 1,
      depth: 0,
      user: userRef,
      overrideAccess: false,
    })
    selectedProgram = byCode.docs[0] ?? null
  }

  if (!selectedProgram) {
    notFound()
  }

  const canonical = programJuryPath(selectedProgram)
  if (`${PORTAL_PATHS.jury}/${programCode}`.toLowerCase() !== canonical.toLowerCase()) {
    redirect(
      programJuryPath(selectedProgram, {
        ...(query ? { q } : {}),
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      }),
    )
  }

  const programListPath = programJuryPath(selectedProgram)
  const inProgram = applications.docs.filter(
    (application) => programIdFromApplication(application) === selectedProgram.id,
  )
  const matched = inProgram.filter((application) => {
    if (!query) {
      return true
    }
    return applicationLabel(application).toLowerCase().includes(query)
  })
  const { incomplete, complete } = partitionJuryApplications(matched, scoredIds)
  const sections =
    statusFilter === 'incomplete'
      ? [{ key: 'incomplete' as const, label: 'Incomplete evaluations', items: incomplete }]
      : statusFilter === 'complete'
        ? [{ key: 'complete' as const, label: 'Completed evaluations', items: complete }]
        : [
            { key: 'incomplete' as const, label: 'Incomplete evaluations', items: incomplete },
            { key: 'complete' as const, label: 'Completed evaluations', items: complete },
          ]

  const scoredInProgram = inProgram.filter((application) => scoredIds.has(application.id)).length

  return (
    <PortalShell
      logoutHref={`${PORTAL_PATHS.jury}/login`}
      showLogout
      title="Jury portal"
      userLabel={displayName(user)}
    >
      <Panel width="wide">
        <Title>
          {selectedProgram.code?.trim() ? `${selectedProgram.code} · ` : ''}
          {selectedProgram.name}
        </Title>
        <Text>
          {scoredInProgram} of {inProgram.length} scored
        </Text>
        {programs.length > 1 ? (
          <TextLink href={PORTAL_PATHS.jury}>Change program</TextLink>
        ) : null}

        <Actions action={programListPath} as="form">
          <Input
            aria-label="Search applications"
            defaultValue={q}
            name="q"
            placeholder="Search"
            type="search"
          />
          <Select aria-label="Evaluation status" defaultValue={statusFilter} name="status">
            <option value="all">All evaluations</option>
            <option value="incomplete">Incomplete</option>
            <option value="complete">Completed</option>
          </Select>
          <Button type="submit">Filter</Button>
        </Actions>

        {matched.length === 0 ? (
          <Text>No applications match this filter.</Text>
        ) : (
          sections.map((section) => (
            <Stack as="section" key={section.key}>
              <Title as="h2">
                {section.label} ({section.items.length})
              </Title>
              {section.items.length === 0 ? (
                <Text>
                  {section.key === 'incomplete'
                    ? 'No incomplete evaluations.'
                    : 'No completed evaluations yet.'}
                </Text>
              ) : (
                <Table variant="framed">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Status</th>
                      <th data-align="end">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map((application) => {
                      const score = scoreByApplication.get(application.id)
                      const complete = section.key === 'complete'
                      return (
                        <tr key={application.id}>
                          <td>
                            <TextLink
                              href={applicationJuryPath({
                                ...application,
                                program: selectedProgram,
                              })}
                            >
                              {applicationLabel(application)}
                            </TextLink>
                          </td>
                          <td>
                            <StatusBadge tone={complete ? 'complete' : 'incomplete'}>
                              {complete ? 'Completed' : 'Incomplete'}
                            </StatusBadge>
                          </td>
                          <td data-align="end">{score ? score.label : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              )}
            </Stack>
          ))
        )}
      </Panel>
    </PortalShell>
  )
}
