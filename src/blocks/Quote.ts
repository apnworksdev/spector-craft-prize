import {
  BoldFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  ParagraphFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

export const QuoteBlock: Block = {
  slug: 'quote',
  interfaceName: 'QuoteBlock',
  labels: {
    singular: 'Quote',
    plural: 'Quotes',
  },
  fields: [
    {
      name: 'quote',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: () => [
          ParagraphFeature(),
          BoldFeature(),
          InlineToolbarFeature(),
          FixedToolbarFeature(),
        ],
      }),
      admin: {
        description: 'Bold a word to make it larger, like Craft / conversation in the homepage quote.',
      },
    },
    {
      name: 'writer',
      type: 'text',
      required: true,
      admin: {
        description: 'Name, e.g. Glenn Adamson.',
      },
    },
    {
      name: 'writerTitle',
      type: 'text',
      admin: {
        description: 'Role or title under the name, e.g. Curator, author, and scholar.',
      },
    },
  ],
}
