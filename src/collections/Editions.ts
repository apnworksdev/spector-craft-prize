import type { CollectionConfig } from 'payload'

import { publicRead } from '@/access/publicRead'
import { pageBuilderField } from '@/blocks'

export const Editions: CollectionConfig = {
  slug: 'editions',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'updatedAt'],
    description: 'One edition per year. Public URL is /{year}-prize-recipients.',
  },
  access: {
    read: publicRead,
  },
  fields: [
    {
      name: 'year',
      type: 'number',
      required: true,
      unique: true,
      min: 2000,
      max: 2100,
      admin: {
        description: 'Used in the public URL, e.g. 2026 → /2026-prize-recipients.',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    pageBuilderField(),
  ],
}
