import type { GlobalConfig } from 'payload'

import { publicRead } from '@/access/publicRead'
import { revalidateGlobal } from '@/hooks/revalidate'

export const Terms: GlobalConfig = {
  slug: 'terms',
  label: 'Terms & Conditions',
  access: {
    read: publicRead,
  },
  hooks: {
    afterChange: [revalidateGlobal('terms')],
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
