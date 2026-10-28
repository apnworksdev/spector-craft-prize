import { notFound, redirect } from 'next/navigation'

import { ApplicationReview } from '@/components/Portal/ApplicationReview'
import { EvaluationSummary } from '@/components/Portal/EvaluationSummary'
import { PortalShell } from '@/components/Portal/PortalShell'
import { StaffNav } from '@/components/Portal/StaffNav'
import { Button, Panel } from '@/components/Portal/ui'
import { findApplicationByProgramSegment } from '@/lib/find-application'
import { toggleEvaluationAction } from '@/lib/portal-actions'
import { applicationStaffPath, displayName, PORTAL_PATHS } from '@/lib/portal'
import { requireAdmin } from '@/lib/portal-auth'
import { getPayloadClient } from '@/lib/payload'

type PageProps = {
  params: Promise<{ programCode: string; applicationSlug: string }>
  searchParams: Promise<{ view?: string }>
}

export default async function StaffApplicationPage({ params, searchParams }: PageProps) {
  const user = await requireAdmin()
  const { programCode, applicationSlug } = await params
  const { view } = await searchParams
  const payload = await getPayloadClient()
  const application = await findApplicationByProgramSegment(programCode, applicationSlug, user)
  if (!application) {
    notFound()
  }

  const canonical = applicationStaffPath(application)
  const requested = `${PORTAL_PATHS.staff}/${programCode}/${applicationSlug}`.toLowerCase()
  if (requested !== canonical.toLowerCase()) {
    redirect(view === 'media' ? `${canonical}?view=media` : canonical)
  }

  const evaluations = await payload.find({
    collection: 'evaluations',
    where: { application: { equals: application.id } },
    depth: 1,
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
        <ApplicationReview
          application={application}
          basePath={canonical}
          showIdentity
          view={view === 'media' ? 'media' : 'forms'}
        />
        <EvaluationSummary evaluations={evaluations.docs} />
        {application.status === 'submitted' ? (
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
        ) : null}
      </Panel>
    </PortalShell>
  )
}
