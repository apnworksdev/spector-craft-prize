import type { ComponentProps } from 'react'

import { CmsRichText } from '@/components/CmsRichText/CmsRichText'

import styles from './ContentColumns.module.css'

type RichText = ComponentProps<typeof CmsRichText>['data']

type ContentColumnsProps = {
  primary?: RichText
  secondary?: RichText
}

export function ContentColumns({ primary, secondary }: ContentColumnsProps) {
  return (
    <article className={styles.page}>
      <div className={styles.columns}>
        <div className={styles.column}>
          <CmsRichText data={primary} className={styles.richText} />
        </div>
        <div className={styles.column}>
          <CmsRichText data={secondary} className={styles.richText} />
        </div>
      </div>
    </article>
  )
}
