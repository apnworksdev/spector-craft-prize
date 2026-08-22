import { CmsRichText } from '@/components/CmsRichText/CmsRichText'
import { getCachedGlobal } from '@/lib/cms'

import styles from './page.module.css'

export const metadata = {
  title: 'Emerging Artists Prize — Spector Craft Prize',
}

export default async function EmergingArtistsPrizePage() {
  const page = await getCachedGlobal('emerging-artists-prize', 2)

  return (
    <article className={styles.page}>
      <div className={styles.columns}>
        <div className={styles.primary}>
          <CmsRichText data={page.primary} className={styles.richText} />
        </div>
        <div className={styles.secondary}>
          <CmsRichText data={page.secondary} className={styles.richText} />
        </div>
      </div>
    </article>
  )
}
