import type { GlobalConfig } from 'payload'

import { publicRead } from '@/access/publicRead'

export const Press: GlobalConfig = {
  slug: 'press',
  label: 'Press',
  access: {
    read: publicRead,
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
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'subtitle',
          type: 'text',
        },
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'd MMM yyyy',
            },
          },
        },
      ],
    },
  ],
}
