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
      label: 'Left column',
      admin: {
        description: 'Intro heading, body copy, and links (e.g. Rules of Entry, FAQ).',
      },
    },
    {
      name: 'secondary',
      type: 'richText',
      label: 'Right column',
      admin: {
        description: 'Timeline, selection criteria, eligibility, and related sections.',
      },
    },
  ],
}
