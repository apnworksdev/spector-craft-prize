import type { GlobalConfig } from 'payload'

import { publicRead } from '@/access/publicRead'

export const EmergingArtistsPrize: GlobalConfig = {
  slug: 'emerging-artists-prize',
  label: 'Emerging Artists Prize',
  access: {
    read: publicRead,
  },
  fields: [
    {
      name: 'primary',
      type: 'richText',
      label: 'Primary',
    },
    {
      name: 'secondary',
      type: 'richText',
      label: 'Secondary',
    },
  ],
}
