import { CmsImage } from '@/components/CmsImage/CmsImage'
import { CmsRichText } from '@/components/CmsRichText/CmsRichText'
import { safeHref } from '@/lib/urls'
import type { Media } from '@/payload-types'

import styles from './PersonCard.module.css'

type PersonCardProps = {
  name: string
  title?: string | null
  bio?: Parameters<typeof CmsRichText>[0]['data']
  image?: (number | null) | Media
  link?: string | null
  layout?: 'inline' | 'stacked'
}

export function PersonCard({
  name,
  title,
  bio,
  image,
  link,
  layout = 'inline',
}: PersonCardProps) {
  return (
    <article className={`${styles.person} ${styles[layout]}`}>
      {image ? (
        <div className={styles.personMedia}>
          <CmsImage
            className={styles.personImage}
            fallbackAlt={name}
            href={layout === 'stacked' ? safeHref(link, '') || null : null}
            size="card"
            sizes="185px"
            value={image}
          />
        </div>
      ) : null}
      <div className={styles.personCopy}>
        <h3 className={styles.personName}>{name}</h3>
        {title ? <p className={styles.personTitle}>{title}</p> : null}
        <CmsRichText data={bio} className={styles.personBio} />
      </div>
    </article>
  )
}
