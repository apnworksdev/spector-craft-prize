import { ContentColumns } from '@/components/ContentColumns/ContentColumns'
import { getCachedGlobal } from '@/lib/cms'

export const metadata = {
  title: 'Privacy Policy — Spector Craft Prize',
}

export default async function PrivacyPage() {
  const page = await getCachedGlobal('privacy', 2)

  return <ContentColumns primary={page.primary} secondary={page.secondary} />
}
