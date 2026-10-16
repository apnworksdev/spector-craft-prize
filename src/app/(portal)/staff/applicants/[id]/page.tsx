import { notFound } from 'next/navigation'

import { ApplicationReview } from '@/components/Portal/ApplicationReview'
import { EvaluationSummary } from '@/components/Portal/EvaluationSummary'
import { PortalShell } from '@/components/Portal/PortalShell'
import { StaffNav } from '@/components/Portal/StaffNav'
import { Button, Panel } from '@/components/Portal/ui'
import { toggleEvaluationAction } from '@/lib/portal-actions'
import { displayName, PORTAL_PATHS } from '@/lib/portal'
import { requireAdmin } from '@/lib/portal-auth'
import { getPayloadClient } from '@/lib/payload'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ view?: string }>
}

export default async function StaffApplicantDetailPage({ params, searchParams }: PageProps) {
  const user = await requireAdmin()

  const { id } = await params
  const { view } = await searchParams
  const payload = await getPayloadClient()

  const userRef = { ...user, collection: 'users' as const }
  let application
  try {
    application = await payload.findByID({
      collection: 'applications',
      id: Number(id),
      depth: 1,
      user: userRef,
    })
  } catch {
    notFound()
  }

  const evaluations = await payload.find({
    collection: 'evaluations',
    where: { application: { equals: application.id } },
    depth: 1,
    limit: 100,
    user: userRef,
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
        <ApplicationReview
          application={application}
          basePath={`${PORTAL_PATHS.staffApplicants}/${application.id}`}
          showIdentity
          view={view === 'media' ? 'media' : 'forms'}
        />
        <EvaluationSummary evaluations={evaluations.docs} />
        <form
          action={async () => {
            'use server'
            await toggleEvaluationAction(application.id)
          }}
        >
          <Button type="submit" variant="primary">
            {application.selectedForEvaluation
              ? 'Remove from evaluation'
              : 'Select for evaluation'}
          </Button>
        </form>
      </Panel>
    </PortalShell>
  )
}
