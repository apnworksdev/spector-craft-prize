import type { Block } from 'payload'

export const RichTextBlock: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  labels: {
    singular: 'Rich text',
    plural: 'Rich text',
  },
  fields: [
    {
      name: 'width',
      type: 'select',
      defaultValue: 'narrow',
      options: [
        { label: 'Narrow', value: 'narrow' },
        { label: 'Wide', value: 'wide' },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
  ],
}
