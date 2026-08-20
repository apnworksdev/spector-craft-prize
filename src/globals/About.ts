import type { GlobalConfig } from 'payload'

import { publicRead } from '@/access/publicRead'
import { revalidateGlobal } from '@/hooks/revalidate'

export const About: GlobalConfig = {
  slug: 'about',
  label: 'About',
  access: {
    read: publicRead,
  },
  hooks: {
    afterChange: [revalidateGlobal('about')],
  },
  fields: [
    {
      name: 'groups',
      type: 'array',
      labels: {
        singular: 'Group',
        plural: 'Groups',
      },
      admin: {
        description: 'Parent groups. Each group can contain title + rich text blocks.',
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          admin: {
            description: 'Optional parent heading.',
          },
        },
        {
          name: 'blocks',
          type: 'array',
          labels: {
            singular: 'Block',
            plural: 'Blocks',
          },
          minRows: 1,
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
