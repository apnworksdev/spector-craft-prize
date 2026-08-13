import { RichText as PayloadRichText } from '@payloadcms/richtext-lexical/react'

import type { RichTextBlock } from '@/payload-types'

type CmsRichTextProps = {
  data?: RichTextBlock['content'] | null
  className?: string
}

export function CmsRichText({ data, className }: CmsRichTextProps) {
  if (!data?.root) {
    return null
  }

  return <PayloadRichText className={className} data={data} />
}
