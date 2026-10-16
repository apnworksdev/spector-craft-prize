import type { GlobalConfig } from 'payload'

import { publicRead } from '@/access/publicRead'
import { revalidateGlobal } from '@/hooks/revalidate'

export const Summit: GlobalConfig = {
  slug: 'summit',
  label: 'Summit',
  access: {
    read: publicRead,
  },
  hooks: {
    afterChange: [revalidateGlobal('summit')],
  },
  fields: [
    {
      name: 'primary',
      type: 'richText',
      label: 'Left column',
      admin: {
        description: 'Optional. Leave empty to keep this column blank.',
      },
    },
    {
      name: 'secondary',
      type: 'richText',
      label: 'Right column',
      admin: {
        description: 'Optional. Leave empty to keep this column blank.',
      },
    },
    {
      name: 'people',
      type: 'array',
      labels: {
        singular: 'Person',
        plural: 'People',
      },
      admin: {
        description:
          'Optional. Shown in the right-hand column. People without a bio sit in a three-across grid (two across on small screens), with the name and title underneath. A person with a bio takes the full row.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          filterOptions: {
            mimeType: { contains: 'image' },
          },
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Role or title under the name.',
          },
        },
        {
          name: 'bio',
          type: 'richText',
        },
      ],
    },
  ],
}
