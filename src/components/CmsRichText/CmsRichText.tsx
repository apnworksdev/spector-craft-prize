import {
  LinkJSXConverter,
  RichText as PayloadRichText,
} from '@payloadcms/richtext-lexical/react'

import { internalDocToHref } from '@/lib/links'
import type { MediaColumnsBlock, RichTextBlock } from '@/payload-types'

import styles from './CmsRichText.module.css'

type CmsRichTextProps = {
  data?: RichTextBlock['content'] | MediaColumnsBlock['columns'][number]['content'] | null
  className?: string
}

export function CmsRichText({ data, className }: CmsRichTextProps) {
  if (!data?.root) {
    return null
  }

  const classNames = [styles.richText, className].filter(Boolean).join(' ')

  return (
    <PayloadRichText
      className={classNames}
      converters={({ defaultConverters }) => ({
        ...defaultConverters,
        ...LinkJSXConverter({ internalDocToHref }),
      })}
      data={data}
    />
  )
}
