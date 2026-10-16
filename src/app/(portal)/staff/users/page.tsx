import { PortalShell } from '@/components/Portal/PortalShell'
import { StaffNav } from '@/components/Portal/StaffNav'
import { Button, FormStack, Panel, Table, TextField, Title } from '@/components/Portal/ui'
import { createJurorUser } from '@/lib/portal-actions'
import { displayName, PORTAL_PATHS } from '@/lib/portal'
import { requireAdmin } from '@/lib/portal-auth'
import { getPayloadClient } from '@/lib/payload'

export default async function StaffUsersPage() {
  const user = await requireAdmin()

  const payload = await getPayloadClient()
  const users = await payload.find({
    collection: 'users',
    limit: 100,
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
        <Title>Users</Title>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Can jury</th>
            </tr>
          </thead>
          <tbody>
            {users.docs.map((entry) => (
              <tr key={entry.id}>
                <td>{displayName(entry)}</td>
                <td>{entry.email}</td>
                <td>{entry.role}</td>
                <td>{entry.role === 'juror' || entry.canJury ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Title as="h2">Create juror account</Title>
        <FormStack action={createJurorUser}>
          <TextField label="First name" name="firstName" required />
          <TextField label="Last name" name="lastName" required />
          <TextField label="Email" name="email" required type="email" />
          <TextField label="Password" name="password" required type="password" />
          <Button type="submit" variant="primary">
            Create juror
          </Button>
        </FormStack>
      </Panel>
    </PortalShell>
  )
}
