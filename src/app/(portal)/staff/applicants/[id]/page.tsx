import { notFound, redirect } from 'next/navigation'

import { findApplicationByPathKey } from '@/lib/find-application'
import { applicationStaffPath } from '@/lib/portal'
import { requireAdmin } from '@/lib/portal-auth'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ view?: string }>
}

export default async function StaffApplicantDetailPage({ params, searchParams }: PageProps) {
  const user = await requireAdmin()
  const { id } = await params
  const { view } = await searchParams
  const application = await findApplicationByPathKey(id, user)
  if (!application) {
    notFound()
  }

  const canonical = applicationStaffPath(application)
  redirect(view === 'media' ? `${canonical}?view=media` : canonical)
}
