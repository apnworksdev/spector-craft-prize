import { CmsImage } from '@/components/CmsImage/CmsImage'
import { getCachedGlobal } from '@/lib/cms'
import { isSafeHttpUrl } from '@/lib/urls'

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
          {press.items.map((item) => {
            const href = isSafeHttpUrl(item.url) ? item.url : undefined
            const body = (
              <>
                <div className={styles.media}>
                  <CmsImage
                    className={styles.image}
                    fallbackAlt={item.title}
                    size="card"
                    sizes="(max-width: 800px) 50vw, 20vw"
                    value={item.image}
                  />
                </div>
                <div className={styles.copy}>
                  <h2 className={styles.title}>{item.title}</h2>
                  {item.subtitle ? <p className={styles.source}>{item.subtitle}</p> : null}
                  <p className={styles.date}>{formatDate(item.date)}</p>
                </div>
              </>
            )

            return (
              <li className={styles.item} key={item.id}>
                {href ? (
                  <a className={styles.link} href={href} rel="noopener noreferrer" target="_blank">
                    {body}
                  </a>
                ) : (
                  <div className={styles.link}>{body}</div>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className={styles.empty}>Press coverage will be published shortly.</p>
      )}
    </article>
  )
}
