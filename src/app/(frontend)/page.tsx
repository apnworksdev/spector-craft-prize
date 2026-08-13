import { PageBuilder } from '@/components/PageBuilder/PageBuilder'
import { getPayloadClient } from '@/lib/payload'

import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayloadClient()
  const home = await payload.findGlobal({ slug: 'home' })

  return (
    <article className={styles.page}>
      {!home.layout?.length ? <h1>Spector Craft Prize</h1> : <PageBuilder layout={home.layout} />}
    </article>
  )
}
