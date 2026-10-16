import { PortalShell } from '@/components/Portal/PortalShell'
import { StaffNav } from '@/components/Portal/StaffNav'
import { Actions, Button, Panel, Table, Title } from '@/components/Portal/ui'
import { setProgramStatusFromForm } from '@/lib/portal-actions'
import { displayName, formatPortalDate, PORTAL_PATHS } from '@/lib/portal'
import { requireAdmin } from '@/lib/portal-auth'
import { getPayloadClient } from '@/lib/payload'

export default async function StaffProgramsPage() {
  const user = await requireAdmin()

  const payload = await getPayloadClient()
  const programs = await payload.find({
    collection: 'programs',
    limit: 20,
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
        <Title>Programs</Title>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Set status</th>
            </tr>
          </thead>
          <tbody>
            {programs.docs.map((program) => (
              <tr key={program.id}>
                <td>{program.name}</td>
                <td>{formatPortalDate(program.deadline, 'short') ?? '—'}</td>
                <td>{program.status}</td>
                <td>
                  <Actions>
                    {(['live', 'closed', 'draft'] as const).map((status) => (
                      <form action={setProgramStatusFromForm} key={status}>
                        <input name="programId" type="hidden" value={program.id} />
                        <input name="status" type="hidden" value={status} />
                        <Button
                          disabled={program.status === status}
                          type="submit"
                          variant={program.status === status ? 'primary' : 'secondary'}
                        >
                          {status}
                        </Button>
                      </form>
                    ))}
                  </Actions>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </PortalShell>
  )
}
