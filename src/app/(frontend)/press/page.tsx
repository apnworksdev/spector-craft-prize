import { CmsImage } from '@/components/CmsImage/CmsImage'
import { getCachedGlobal } from '@/lib/cms'

import styles from './page.module.css'

export const metadata = {
  title: 'Press — Spector Craft Prize',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export default async function PressPage() {
  const press = await getCachedGlobal('press', 1)

  return (
    <article className={styles.page}>
      <h1 className="sr-only">Press</h1>
      {press.items?.length ? (
        <ul className={styles.list}>
          {press.items.map((item) => (
            <li className={styles.item} key={item.id}>
              <a
                className={styles.link}
                href={item.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                <div className={styles.media}>
                  <CmsImage
                    className={styles.image}
                    fallbackAlt={item.title}
                    sizes="(max-width: 800px) 50vw, 20vw"
                    value={item.image}
                  />
                </div>
                <div className={styles.copy}>
                  <h2 className={styles.title}>{item.title}</h2>
                  {item.subtitle ? <p className={styles.source}>{item.subtitle}</p> : null}
                  <p className={styles.date}>{formatDate(item.date)}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
