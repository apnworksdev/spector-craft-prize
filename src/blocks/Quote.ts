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
      type: 'textarea',
      required: true,
    },
    {
      name: 'writer',
      type: 'text',
      required: true,
      admin: {
        description: 'Attribution, e.g. the speaker or author.',
      },
    },
  ],
}
