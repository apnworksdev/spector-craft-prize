import type { GlobalConfig } from 'payload'

import { publicRead } from '@/access/publicRead'
import { revalidateGlobal } from '@/hooks/revalidate'

export const Privacy: GlobalConfig = {
  slug: 'privacy',
  label: 'Privacy Policy',
  access: {
    read: publicRead,
  },
  hooks: {
    afterChange: [revalidateGlobal('privacy')],
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
  ],
}
