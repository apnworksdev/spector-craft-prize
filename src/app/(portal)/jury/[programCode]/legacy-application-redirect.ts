import { notFound, redirect } from 'next/navigation'

import { applicationJuryPath } from '@/lib/portal'
import { getPayloadClient } from '@/lib/payload'
import type { User } from '@/payload-types'

export async function redirectLegacyJuryApplication(
  user: User,
  applicationId: number,
  query: { view?: string; program?: string },
) {
  const payload = await getPayloadClient()
  let application
  try {
    application = await payload.findByID({
      collection: 'applications',
      id: applicationId,
      depth: 1,
      user: { ...user, collection: 'users' },
      overrideAccess: false,
    })
  } catch {
    notFound()
  }

  redirect(
    applicationJuryPath(application, {
      ...(query.view === 'media' ? { view: 'media' } : {}),
    }),
  )
}
