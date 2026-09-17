import { ContentColumns } from '@/components/ContentColumns/ContentColumns'
import { getCachedGlobal } from '@/lib/cms'

export const revalidate = 60

export const metadata = {
  title: 'Emerging Artists Prize — Spector Craft Prize',
}

export default async function EmergingArtistsPrizePage() {
  const page = await getCachedGlobal('emerging-artists-prize', 2)

  return <ContentColumns primary={page.primary} secondary={page.secondary} />
}
