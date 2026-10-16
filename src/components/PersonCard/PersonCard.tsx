import { CmsImage } from '@/components/CmsImage/CmsImage'
import { CmsRichText } from '@/components/CmsRichText/CmsRichText'
import { hasLexicalText } from '@/lib/richText'
import { safeHref } from '@/lib/urls'
import type { Media } from '@/payload-types'

import styles from './PersonCard.module.css'

type PersonCardProps = {
  name: string
  title?: string | null
  bio?: Parameters<typeof CmsRichText>[0]['data']
  image?: (number | null) | Media
  link?: string | null
  layout?: 'inline' | 'stacked' | 'grid'
  className?: string
}

export function PersonCard({
  name,
  title,
  bio,
  image,
  link,
  layout = 'inline',
  className,
}: PersonCardProps) {
  const imageSizes = layout === 'grid' ? '(max-width: 640px) 46vw, 16vw' : '185px'

  return (
    <article className={[styles.person, styles[layout], className].filter(Boolean).join(' ')}>
      {image ? (
        <div className={styles.personMedia}>
          <CmsImage
            className={styles.personImage}
            fallbackAlt={name}
            href={layout === 'stacked' ? safeHref(link, '') || null : null}
            size="card"
            sizes={imageSizes}
            value={image}
          />
        </div>
      ) : null}
      <div className={styles.personCopy}>
        <h3 className={styles.personName}>{name}</h3>
        {title ? <p className={styles.personTitle}>{title}</p> : null}
        {hasLexicalText(bio) ? <CmsRichText data={bio} className={styles.personBio} /> : null}
      </div>
    </article>
  )
}
