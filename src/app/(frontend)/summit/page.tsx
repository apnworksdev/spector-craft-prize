import { ContentColumns } from '@/components/ContentColumns/ContentColumns'
import { getCachedGlobal } from '@/lib/cms'

export const metadata = {
  title: 'Summit — Spector Craft Prize',
}

export default async function SummitPage() {
  const page = await getCachedGlobal('summit', 2)

  return <ContentColumns primary={page.primary} secondary={page.secondary} />
}
