import { redirect } from 'next/navigation'

import { PORTAL_PATHS } from '@/lib/portal'

export default function ApplicationIndexPage() {
  redirect(`${PORTAL_PATHS.application}/personal`)
}
