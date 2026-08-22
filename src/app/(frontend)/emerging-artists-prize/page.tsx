import { CmsRichText } from '@/components/CmsRichText/CmsRichText'
import columns from '@/components/ContentColumns/ContentColumns.module.css'
import { getCachedGlobal } from '@/lib/cms'

export const metadata = {
  title: 'Emerging Artists Prize — Spector Craft Prize',
}

export default async function EmergingArtistsPrizePage() {
  const page = await getCachedGlobal('emerging-artists-prize', 2)

  return (
    <article className={columns.page}>
      <div className={columns.columns}>
        <CmsRichText data={page.primary} className={columns.richText} />
        <CmsRichText data={page.secondary} className={columns.richText} />
      </div>
    </article>
  )
}
