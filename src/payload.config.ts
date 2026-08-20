import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor, FixedToolbarFeature, LinkFeature } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { getServerURL } from './lib/env'
import { MAX_UPLOAD_BYTES } from './lib/upload'
import { Editions } from './collections/Editions'
import { Media } from './collections/Media'
import { PrizeRecipients } from './collections/PrizeRecipients'
import { Users } from './collections/Users'
import { About } from './globals/About'
import { EmergingArtistsPrize } from './globals/EmergingArtistsPrize'
import { Home } from './globals/Home'
import { Press } from './globals/Press'
import { r2Storage } from './storage/r2'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const serverURL = getServerURL()

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
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter((feature) => feature.key !== 'link'),
      LinkFeature({
        disabledCollections: ['users'],
        maxDepth: 2,
      }),
      FixedToolbarFeature(),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL,
  cors: [serverURL],
  csrf: [serverURL],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: 10,
    },
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  upload: {
    abortOnLimit: true,
    limits: {
      fileSize: MAX_UPLOAD_BYTES,
    },
  },
  plugins: [r2Storage],
})
