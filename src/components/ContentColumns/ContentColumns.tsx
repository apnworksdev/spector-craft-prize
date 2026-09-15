import type { ComponentProps } from 'react'

import { CmsRichText } from '@/components/CmsRichText/CmsRichText'
import { PersonCard } from '@/components/PersonCard/PersonCard'
import type { Summit } from '@/payload-types'

import styles from './ContentColumns.module.css'

type RichText = ComponentProps<typeof CmsRichText>['data']

type ContentColumnsProps = {
  primary?: RichText
  secondary?: RichText
  people?: Summit['people']
  /** `compact` matches About Jury/Advisory bios (16px). */
  size?: 'default' | 'compact'
}

export function ContentColumns({
  primary,
  secondary,
  people,
  size = 'default',
}: ContentColumnsProps) {
  const richTextClass = size === 'compact' ? styles.compactRichText : styles.richText
  const portraits = (people ?? []).filter((person) => person.name)

  return (
    <article className={styles.page}>
      <div className={styles.columns}>
        <div className={styles.column}>
          <CmsRichText data={primary} className={richTextClass} />
        </div>
        <div className={styles.column}>
          <CmsRichText data={secondary} className={richTextClass} />
          {portraits.length ? (
            <div className={styles.people}>
              {portraits.map((person) => (
                <PersonCard
                  bio={person.bio}
                  image={person.image}
                  key={person.id}
                  name={person.name}
                  title={person.title}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
