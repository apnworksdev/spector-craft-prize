import type { GlobalConfig } from 'payload'

import { publicRead } from '@/access/publicRead'
import { revalidateGlobal } from '@/hooks/revalidate'

export const Press: GlobalConfig = {
  slug: 'press',
  label: 'Press',
  access: {
    read: publicRead,
  },
  hooks: {
    afterChange: [revalidateGlobal('press')],
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      labels: {
        singular: 'Item',
        plural: 'Items',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          filterOptions: {
            mimeType: { contains: 'image' },
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'subtitle',
          type: 'text',
          label: 'Source',
          admin: {
            description: 'Publication and/or author, e.g. “Cultured, Mokshaa Shivlani”.',
          },
        },
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'd MMMM yyyy',
            },
          },
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            description: 'External article URL. The whole item links here.',
          },
        },
      ],
    },
  ],
}
