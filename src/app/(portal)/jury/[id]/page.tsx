import { notFound } from 'next/navigation'

import { ApplicationReview } from '@/components/Portal/ApplicationReview'
import { JuryScoreForm } from '@/components/Portal/JuryScoreForm'
import { PortalShell } from '@/components/Portal/PortalShell'
import { Panel, TextLink } from '@/components/Portal/ui'
import { displayName, PORTAL_PATHS } from '@/lib/portal'
import { requireJuryAccess } from '@/lib/portal-auth'
import { getPayloadClient } from '@/lib/payload'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ view?: string }>
}

export default async function JuryApplicationPage({ params, searchParams }: PageProps) {
  const user = await requireJuryAccess()
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

  const evaluation = await payload.find({
    collection: 'evaluations',
    where: {
      and: [{ application: { equals: application.id } }, { juror: { equals: user.id } }],
    },
    limit: 1,
    depth: 0,
    user: userRef,
  })
  const mine = evaluation.docs[0]

  return (
    <PortalShell
      logoutHref={`${PORTAL_PATHS.jury}/login`}
      showLogout
      title="Jury portal"
      userLabel={displayName(user)}
    >
      <Panel width="wide">
        <TextLink href={PORTAL_PATHS.jury}>&lt; Back</TextLink>
        <ApplicationReview
          application={application}
          basePath={`${PORTAL_PATHS.jury}/${application.id}`}
          view={view === 'media' ? 'media' : 'forms'}
        />
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
        />
      </Panel>
    </PortalShell>
  )
}
