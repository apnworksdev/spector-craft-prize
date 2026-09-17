import { AboutSections } from '@/components/AboutSections/AboutSections'
import columns from '@/components/ContentColumns/ContentColumns.module.css'
import { getCachedGlobal } from '@/lib/cms'

import styles from '../status.module.css'

export const revalidate = 60

export const metadata = {
  title: 'About — Spector Craft Prize',
}

export default async function AboutPage() {
  const about = await getCachedGlobal('about', 2)

  if (!about.groups?.length) {
    return (
      <article className={styles.page}>
        <h1>About</h1>
        <p>This page will be published shortly.</p>
      </article>
    )
  }

  return (
    <article className={columns.page}>
      <AboutSections groups={about.groups} />
    </article>
  )
}
