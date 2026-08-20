import { PageBuilder } from '@/components/PageBuilder/PageBuilder'
import { getCachedGlobal } from '@/lib/cms'

import styles from './page.module.css'

export default async function HomePage() {
  const home = await getCachedGlobal('home', 2)

  return (
    <article className={styles.page}>
      {!home.layout?.length ? <h1>Spector Craft Prize</h1> : <PageBuilder layout={home.layout} />}
    </article>
  )
}
