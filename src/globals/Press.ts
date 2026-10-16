import type { GlobalConfig } from 'payload'

import { publicRead } from '@/access/publicRead'
import { revalidateGlobal } from '@/hooks/revalidate'
import { isSafeHttpUrl } from '@/lib/urls'

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
      name: 'inquiryEmail',
      type: 'email',
      defaultValue: 'spectorcraftprize@dadagoldberg.com',
      admin: {
        description: 'Shown at the top of the Press page. Leave empty to use the default address.',
      },
    },
    {
      name: 'pressReleaseLabel',
      type: 'text',
      defaultValue: 'Spector Craft Prize Press Release',
      admin: {
        description: 'Link text for the press release PDF.',
      },
    },
    {
      name: 'pressRelease',
      type: 'upload',
      relationTo: 'documents',
      admin: {
        description: 'Optional PDF. The label above links here.',
      },
    },
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
          validate: (value: unknown) => {
            if (!value) {
              return 'Required'
            }

            return isSafeHttpUrl(String(value)) || 'Enter a full http(s) URL.'
          },
        },
      ],
    },
  ],
}
