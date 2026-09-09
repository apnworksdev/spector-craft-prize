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
        { label: 'Wide (~2/3 page)', value: 'wide' },
      ],
      admin: {
        description: 'Wide is about two-thirds of the page; narrow is a centered reading column.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
  ],
}
