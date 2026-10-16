import { PortalShell } from '@/components/Portal/PortalShell'
import { StaffNav } from '@/components/Portal/StaffNav'
import {
  Actions,
  Button,
  Input,
  Panel,
  Select,
  Stack,
  Text,
  TextLink,
  Title,
} from '@/components/Portal/ui'
import { applicantBucket, type ApplicantBucket } from '@/lib/applicant-status'
import { applicationLabel, displayName, PORTAL_PATHS } from '@/lib/portal'
import { requireAdmin } from '@/lib/portal-auth'
import { getPayloadClient } from '@/lib/payload'

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string }>
}

const BUCKETS: Array<{ key: ApplicantBucket; label: string }> = [
  { key: 'completed', label: 'Completed' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'not_started', label: 'Not started' },
]

export default async function StaffApplicantsPage({ searchParams }: PageProps) {
  const user = await requireAdmin()

  const { q = '', status = '' } = await searchParams
  const query = q.trim().toLowerCase()
  const selectedBucket = BUCKETS.some((bucket) => bucket.key === status)
    ? (status as ApplicantBucket)
    : null

  const payload = await getPayloadClient()
  const applications = await payload.find({
    collection: 'applications',
    depth: 1,
    limit: 200,
    user: { ...user, collection: 'users' },
  })

  const buckets = {
    completed: [] as typeof applications.docs,
    in_progress: [] as typeof applications.docs,
    not_started: [] as typeof applications.docs,
  }

  for (const application of applications.docs) {
    const applicant = typeof application.applicant === 'object' ? application.applicant : null
    const name = (applicant ? displayName(applicant) : '').toLowerCase()
    const email = applicant?.email?.toLowerCase() ?? ''
    if (query && !name.includes(query) && !email.includes(query)) {
      continue
    }

    const bucket = applicantBucket(application)
    if (selectedBucket && bucket !== selectedBucket) {
      continue
    }

    buckets[bucket].push(application)
  }

  return (
    <PortalShell
      logoutHref={`${PORTAL_PATHS.staff}/login`}
      showLogout
      title="Staff portal"
      userLabel={displayName(user)}
    >
      <Panel width="wide">
        <StaffNav user={user} />
        <Title>Applications</Title>
        <Actions action={PORTAL_PATHS.staffApplicants} as="form">
          <Input
            aria-label="Search applications"
            defaultValue={q}
            name="q"
            placeholder="Search"
            type="search"
          />
          <Select aria-label="Application status" defaultValue={status} name="status">
            <option value="">Application status</option>
            {BUCKETS.map((bucket) => (
              <option key={bucket.key} value={bucket.key}>
                {bucket.label}
              </option>
            ))}
          </Select>
          <Button type="submit">Search</Button>
        </Actions>
        {BUCKETS.filter((bucket) => !selectedBucket || bucket.key === selectedBucket).map(
          (bucket) => (
            <Stack as="section" key={bucket.key}>
              <Title as="h2">{bucket.label}</Title>
              {buckets[bucket.key].length === 0 ? (
                <Text>No applications.</Text>
              ) : (
                <Stack as="ul">
                  {buckets[bucket.key].map((application) => (
                    <li key={application.id}>
                      <TextLink href={`${PORTAL_PATHS.staffApplicants}/${application.id}`}>
                        {applicationLabel(application)}
                      </TextLink>
                    </li>
                  ))}
                </Stack>
              )}
            </Stack>
          ),
        )}
      </Panel>
    </PortalShell>
  )
}
