import type { GlobalConfig } from 'payload'

import { publicRead } from '@/access/publicRead'
import { pageBuilderField } from '@/blocks'
import { revalidateGlobal } from '@/hooks/revalidate'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Home',
  access: {
    read: publicRead,
  },
  hooks: {
    afterChange: [revalidateGlobal('home')],
  },
  fields: [pageBuilderField()],
}
