import {
  LinkJSXConverter,
  RichText as PayloadRichText,
} from '@payloadcms/richtext-lexical/react'

import { internalDocToHref } from '@/lib/links'
import type {
  About,
  AboutPersonSubBlock,
  AboutTextSubBlock,
  EmergingArtistsPrize,
  MediaColumnsBlock,
  PrizeRecipient,
  RichTextBlock,
} from '@/payload-types'

import styles from './CmsRichText.module.css'

type LexicalRichText =
  | RichTextBlock['content']
  | MediaColumnsBlock['columns'][number]['content']
  | NonNullable<PrizeRecipient['main']>['content']
  | NonNullable<PrizeRecipient['secondary']>['content']
  | PrizeRecipient['content']
  | EmergingArtistsPrize['primary']
  | EmergingArtistsPrize['secondary']
  | NonNullable<NonNullable<About['groups']>[number]['blocks']>[number]['content']
  | AboutTextSubBlock['content']
  | AboutPersonSubBlock['bio']

type CmsRichTextProps = {
  data?: LexicalRichText | null
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
