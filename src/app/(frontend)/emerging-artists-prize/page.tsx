import { CmsRichText } from '@/components/CmsRichText/CmsRichText'
import { getPayloadClient } from '@/lib/payload'

import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Emerging Artists Prize — Spector Craft Prize',
}

export default async function EmergingArtistsPrizePage() {
  const payload = await getPayloadClient()
  const page = await payload.findGlobal({ slug: 'emerging-artists-prize' })

  return (
    <article className={styles.page}>
      <h1>Emerging Artists Prize</h1>
      <div className={styles.columns}>
        <div>
          <CmsRichText data={page.primary} />
        </div>
        <div>
          <CmsRichText data={page.secondary} />
        </div>
      </div>
    </article>
  )
}
