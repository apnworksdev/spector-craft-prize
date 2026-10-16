import { PortalShell } from '@/components/Portal/PortalShell'
import { StaffNav } from '@/components/Portal/StaffNav'
import { Panel, Stack, Table, Text, TextLink, Title } from '@/components/Portal/ui'
import { applicantBucket } from '@/lib/applicant-status'
import { displayName, formatPortalDate, PORTAL_PATHS, relationId } from '@/lib/portal'
import { requireAdmin } from '@/lib/portal-auth'
import { getPayloadClient } from '@/lib/payload'

export default async function StaffDashboardPage() {
  const user = await requireAdmin()

  const payload = await getPayloadClient()
  const userRef = { ...user, collection: 'users' as const }
  const [programs, applications, users] = await Promise.all([
    payload.find({ collection: 'programs', limit: 10, user: userRef }),
    payload.find({
      collection: 'applications',
      limit: 200,
      depth: 0,
      user: userRef,
    }),
    payload.find({
      collection: 'users',
      limit: 100,
      depth: 0,
      user: userRef,
    }),
  ])

  return (
    <PortalShell
      logoutHref={`${PORTAL_PATHS.staff}/login`}
      showLogout
      title="Staff portal"
      userLabel={displayName(user)}
    >
      <Panel width="wide">
        <StaffNav user={user} />
        <Title>Dashboard</Title>
        {programs.docs.map((program) => {
          const related = applications.docs.filter(
            (application) => relationId(application.program) === program.id,
          )
          const submitted = related.filter(
            (application) => application.status === 'submitted',
          ).length
          const counts = { completed: 0, in_progress: 0, not_started: 0 }
          for (const application of related) {
            counts[applicantBucket(application)] += 1
          }
          const deadline = formatPortalDate(program.deadline, 'short') ?? '—'

          return (
            <Stack as="section" key={program.id}>
              <Title as="h2">{program.name}</Title>
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{program.name}</td>
                    <td>{deadline}</td>
                  </tr>
                </tbody>
              </Table>
              <Text>Submitted: {submitted}</Text>
              <Text>Status: {program.status}</Text>
              <Title as="h2">Applications</Title>
              <Text>Completed: {counts.completed}</Text>
              <Text>In progress: {counts.in_progress}</Text>
              <Text>Not started: {counts.not_started}</Text>
            </Stack>
          )
        })}
        <Stack as="section">
          <Title as="h2">Users</Title>
          <Stack as="ul">
            {users.docs.map((entry) => (
              <li key={entry.id}>{displayName(entry)}</li>
            ))}
          </Stack>
          <TextLink href={PORTAL_PATHS.staffApplicants}>View applications</TextLink>
        </Stack>
      </Panel>
    </PortalShell>
  )
}
