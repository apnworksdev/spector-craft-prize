import { AboutSections } from '@/components/AboutSections/AboutSections'
import columns from '@/components/ContentColumns/ContentColumns.module.css'
import { getCachedGlobal } from '@/lib/cms'

export const metadata = {
  title: 'About — Spector Craft Prize',
}

export default async function AboutPage() {
  const about = await getCachedGlobal('about', 2)

  if (!about.groups?.length) {
    return null
  }

  return (
    <article className={columns.page}>
      <AboutSections groups={about.groups} />
    </article>
  )
}
