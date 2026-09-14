import type { ComponentProps } from 'react'

import { CmsRichText } from '@/components/CmsRichText/CmsRichText'

import styles from './ContentColumns.module.css'

type RichText = ComponentProps<typeof CmsRichText>['data']

type ContentColumnsProps = {
  primary?: RichText
  secondary?: RichText
  /** `compact` matches About Jury/Advisory bios (16px). */
  size?: 'default' | 'compact'
}

export function ContentColumns({ primary, secondary, size = 'default' }: ContentColumnsProps) {
  const richTextClass = size === 'compact' ? styles.compactRichText : styles.richText

  return (
    <article className={styles.page}>
      <div className={styles.columns}>
        <div className={styles.column}>
          <CmsRichText data={primary} className={richTextClass} />
        </div>
        <div className={styles.column}>
          <CmsRichText data={secondary} className={richTextClass} />
        </div>
      </div>
    </article>
  )
}
