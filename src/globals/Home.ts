import type { GlobalConfig } from 'payload'

import { publicRead } from '@/access/publicRead'
import { pageBuilderField } from '@/blocks'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Home',
  access: {
    read: publicRead,
  },
  fields: [pageBuilderField()],
}
