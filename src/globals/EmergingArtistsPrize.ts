import type { GlobalConfig } from 'payload'

import { publicRead } from '@/access/publicRead'
import { revalidateGlobal } from '@/hooks/revalidate'

export const EmergingArtistsPrize: GlobalConfig = {
  slug: 'emerging-artists-prize',
  label: 'Emerging Artists Prize',
  access: {
    read: publicRead,
  },
  hooks: {
    afterChange: [revalidateGlobal('emerging-artists-prize')],
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
