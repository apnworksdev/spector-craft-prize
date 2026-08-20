import type { BlocksField } from 'payload'

import { BannerBlock } from './Banner'
import { MediaColumnsBlock } from './MediaColumns'
import { QuoteBlock } from './Quote'
import { RichTextBlock } from './RichText'

export const pageBuilderBlocks = [BannerBlock, RichTextBlock, MediaColumnsBlock, QuoteBlock]

export const pageBuilderField = (): BlocksField => ({
  name: 'layout',
  type: 'blocks',
  blocks: pageBuilderBlocks,
  admin: {
    description: 'Ordered homepage (and edition) sections.',
  },
})
