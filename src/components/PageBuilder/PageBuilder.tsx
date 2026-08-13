import type { RichTextBlock } from '@/payload-types'

import { CmsRichText } from '@/components/CmsRichText/CmsRichText'

import styles from './PageBuilder.module.css'

type PageBuilderProps = {
  layout?: RichTextBlock[] | null
}

export function PageBuilder({ layout }: PageBuilderProps) {
  if (!layout?.length) {
    return null
  }

  return (
    <div className={styles.sections}>
      {layout.map((block) => {
        if (block.blockType === 'richText') {
          return (
            <section className={styles.section} key={block.id}>
              <CmsRichText data={block.content} />
            </section>
          )
        }

        return null
      })}
    </div>
  )
}
