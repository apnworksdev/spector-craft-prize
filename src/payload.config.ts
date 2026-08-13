import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Editions } from './collections/Editions'
import { Media } from './collections/Media'
import { PrizeRecipients } from './collections/PrizeRecipients'
import { Users } from './collections/Users'
import { About } from './globals/About'
import { EmergingArtistsPrize } from './globals/EmergingArtistsPrize'
import { Home } from './globals/Home'
import { Press } from './globals/Press'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — Spector Craft Prize',
    },
  },
  collections: [Users, Media, Editions, PrizeRecipients],
  globals: [Home, About, Press, EmergingArtistsPrize],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
