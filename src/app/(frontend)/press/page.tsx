import { CmsImage } from '@/components/CmsImage/CmsImage'
import { getCachedGlobal } from '@/lib/cms'
import { isSafeHttpUrl, safeHref } from '@/lib/urls'
import type { Document } from '@/payload-types'

import styles from './page.module.css'

const DEFAULT_INQUIRY_EMAIL = 'spectorcraftprize@dadagoldberg.com'
const DEFAULT_RELEASE_LABEL = 'Spector Craft Prize Press Release'

export const revalidate = 60

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

function pressReleaseHref(file: number | Document | null | undefined) {
  if (!file || typeof file !== 'object' || !file.url) {
    return ''
  }

  return safeHref(file.url, '')
}

export default async function PressPage() {
  const press = await getCachedGlobal('press', 1)
  const inquiryEmail = press.inquiryEmail?.trim() || DEFAULT_INQUIRY_EMAIL
  const releaseLabel = press.pressReleaseLabel?.trim() || DEFAULT_RELEASE_LABEL
  const releaseHref = pressReleaseHref(press.pressRelease)

  return (
    <article className={styles.page}>
      <h1 className="sr-only">Press</h1>
      <div className={styles.intro}>
        <p>
          All press inquiries should be directed to{' '}
          <a href={`mailto:${inquiryEmail}`}>{inquiryEmail}</a>
        </p>
        {releaseHref ? (
          <p>
            <a href={releaseHref} rel="noopener noreferrer" target="_blank">
              {releaseLabel}
            </a>
          </p>
        ) : null}
      </div>
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
