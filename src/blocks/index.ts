import type { BlocksField } from 'payload'

import { RichTextBlock } from './RichText'

export const pageBuilderBlocks = [RichTextBlock]

export const pageBuilderField = (): BlocksField => ({
  name: 'layout',
  type: 'blocks',
  blocks: pageBuilderBlocks,
  admin: {
    description: 'Ordered sections. More section types will be added later.',
  },
})
