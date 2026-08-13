import { getPayloadClient } from '@/lib/payload'
import { mediaAlt, mediaUrl } from '@/lib/media'

import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Press — Spector Craft Prize',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export default async function PressPage() {
  const payload = await getPayloadClient()
  const press = await payload.findGlobal({ slug: 'press', depth: 1 })

  return (
    <article className={styles.page}>
      <h1>Press</h1>
      <ul className={styles.list}>
        {press.items?.map((item) => {
          const src = mediaUrl(item.image)

          return (
            <li className={styles.item} key={item.id}>
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={mediaAlt(item.image, item.title)} src={src} />
              ) : null}
              <div>
                <h2>{item.title}</h2>
                {item.subtitle ? <p className={styles.subtitle}>{item.subtitle}</p> : null}
                <p className={styles.date}>{formatDate(item.date)}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
