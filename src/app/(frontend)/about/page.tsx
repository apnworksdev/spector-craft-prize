import { CmsRichText } from '@/components/CmsRichText/CmsRichText'
import { getPayloadClient } from '@/lib/payload'

import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'About — Spector Craft Prize',
}

export default async function AboutPage() {
  const payload = await getPayloadClient()
  const about = await payload.findGlobal({ slug: 'about' })

  return (
    <article className={styles.page}>
      <h1>About</h1>
      <div className={styles.groups}>
        {about.groups?.map((group) => (
          <section className={styles.group} key={group.id}>
            {group.heading ? <h2>{group.heading}</h2> : null}
            {group.blocks?.map((block) => (
              <div className={styles.block} key={block.id}>
                <h3>{block.title}</h3>
                <CmsRichText data={block.content} />
              </div>
            ))}
          </section>
        ))}
      </div>
    </article>
  )
}
