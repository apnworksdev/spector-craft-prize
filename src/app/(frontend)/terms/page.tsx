import { ContentColumns } from '@/components/ContentColumns/ContentColumns'
import { getCachedGlobal } from '@/lib/cms'

export const metadata = {
  title: 'Terms & Conditions — Spector Craft Prize',
}

export default async function TermsPage() {
  const page = await getCachedGlobal('terms', 2)

  return <ContentColumns primary={page.primary} secondary={page.secondary} />
}
