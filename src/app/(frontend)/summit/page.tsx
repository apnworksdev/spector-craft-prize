import { ContentColumns } from '@/components/ContentColumns/ContentColumns'
import { getCachedGlobal } from '@/lib/cms'

export const revalidate = 60

export const metadata = {
  title: 'Summit — Spector Craft Prize',
}

export default async function SummitPage() {
  const page = await getCachedGlobal('summit', 2)

  return <ContentColumns people={page.people} primary={page.primary} secondary={page.secondary} />
}
