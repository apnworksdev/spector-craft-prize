import { notFound, redirect } from 'next/navigation'

import { isAdmin } from '@/access/roles'
import { ApplicationReview } from '@/components/Portal/ApplicationReview'
import { JuryScoreForm } from '@/components/Portal/JuryScoreForm'
import { PortalShell } from '@/components/Portal/PortalShell'
import { TextLink } from '@/components/Portal/ui'
import layoutStyles from '@/components/Portal/JuryApplicationLayout.module.css'
import {
  applicationJuryPath,
  displayName,
  PORTAL_PATHS,
  programJuryPath,
} from '@/lib/portal'
import { findApplicationByProgramSegment } from '@/lib/find-application'
import { requireJuryAccess } from '@/lib/portal-auth'
import { getPayloadClient } from '@/lib/payload'

type PageProps = {
  params: Promise<{ programCode: string; applicationSlug: string }>
  searchParams: Promise<{ view?: string }>
}

export default async function JuryApplicationPage({ params, searchParams }: PageProps) {
  const user = await requireJuryAccess()
  const { programCode, applicationSlug } = await params
  const { view } = await searchParams
  const payload = await getPayloadClient()
  const userRef = { ...user, collection: 'users' as const }
  const application = await findApplicationByProgramSegment(programCode, applicationSlug, user)
  if (!application) {
    notFound()
  }

  if (
    application.status !== 'submitted' ||
    (isAdmin(user) && !application.selectedForEvaluation)
  ) {
    notFound()
  }

  const reviewBasePath = applicationJuryPath(application)
  const requestedBase = `${PORTAL_PATHS.jury}/${programCode}/${applicationSlug}`.toLowerCase()
  if (requestedBase !== reviewBasePath.toLowerCase()) {
    redirect(
      applicationJuryPath(application, {
        ...(view === 'media' ? { view: 'media' } : {}),
      }),
    )
  }

  const evaluation = await payload.find({
    collection: 'evaluations',
    where: {
      and: [{ application: { equals: application.id } }, { juror: { equals: user.id } }],
    },
    limit: 1,
    depth: 0,
    user: userRef,
    overrideAccess: false,
  })
  const mine = evaluation.docs[0]
  const backHref = programJuryPath(application.program)

  return (
    <PortalShell
      logoutHref={`${PORTAL_PATHS.jury}/login`}
      showLogout
      title="Jury portal"
      userLabel={displayName(user)}
    >
      <div className={layoutStyles.page}>
        <div className={layoutStyles.topBar}>
          <TextLink href={backHref}>&lt; Back</TextLink>
          <a className={layoutStyles.scoreAnchor} href="#jury-score">
            Score
          </a>
        </div>

        <div className={layoutStyles.layout}>
          <div className={layoutStyles.main}>
            <ApplicationReview
              application={application}
              basePath={reviewBasePath}
              view={view === 'media' ? 'media' : 'forms'}
            />
          </div>

          <aside
            aria-labelledby="jury-score-heading"
            className={layoutStyles.aside}
            id="jury-score"
          >
            <JuryScoreForm
              applicationId={application.id}
              initial={
                mine
                  ? {
                      artisticExcellence: mine.artisticExcellence,
                      culturalSignificance: mine.culturalSignificance,
                      growthPotential: mine.growthPotential,
                      missionAlignment: mine.missionAlignment,
                      notes: mine.notes,
                    }
                  : null
              }
              returnTo={backHref}
            />
          </aside>
        </div>
      </div>
    </PortalShell>
  )
}
