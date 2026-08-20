import { CmsImage } from '@/components/CmsImage/CmsImage'
import { getCachedGlobal } from '@/lib/cms'

import styles from './page.module.css'

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
  const press = await getCachedGlobal('press', 1)

  return (
    <article className={styles.page}>
      <h1>Press</h1>
      <ul className={styles.list}>
        {press.items?.map((item) => (
          <li className={styles.item} key={item.id}>
            <CmsImage
              fallbackAlt={item.title}
              size="card"
              sizes="(max-width: 42rem) 100vw, 672px"
              value={item.image}
            />
            <div>
              <h2>{item.title}</h2>
              {item.subtitle ? <p className={styles.subtitle}>{item.subtitle}</p> : null}
              <p className={styles.date}>{formatDate(item.date)}</p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}
