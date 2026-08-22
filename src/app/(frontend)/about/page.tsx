import { AboutSections } from '@/components/AboutSections/AboutSections'
import { getCachedGlobal } from '@/lib/cms'

import styles from './page.module.css'

export const metadata = {
  title: 'About — Spector Craft Prize',
}

export default async function AboutPage() {
  const about = await getCachedGlobal('about', 2)

  if (!about.groups?.length) {
    return null
  }

  return (
    <article className={styles.page}>
      <AboutSections groups={about.groups} />
    </article>
  )
}
