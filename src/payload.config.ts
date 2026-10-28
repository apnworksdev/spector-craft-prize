import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor, FixedToolbarFeature, LinkFeature } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Applicants } from './collections/Applicants'
import { Applications } from './collections/Applications'
import { Evaluations } from './collections/Evaluations'
import { Editions } from './collections/Editions'
import { Documents } from './collections/Documents'
import { Media } from './collections/Media'
import { PrizeRecipients } from './collections/PrizeRecipients'
import { Programs } from './collections/Programs'
import { SubmissionFiles } from './collections/SubmissionFiles'
import { Users } from './collections/Users'
import { About } from './globals/About'
import { EmergingArtistsPrize } from './globals/EmergingArtistsPrize'
import { Home } from './globals/Home'
import { Navigation } from './globals/Navigation'
import { Press } from './globals/Press'
import { Privacy } from './globals/Privacy'
import { Summit } from './globals/Summit'
import { Terms } from './globals/Terms'
import { backfillApplicantIdentities } from './hooks/applicants'
import {
  backfillApplicationFileLinks,
  backfillApplicationListTitles,
} from './hooks/applications'
import {
  backfillApplicationPanelGrades,
  backfillEvaluationIdentities,
  backfillEvaluationTotals,
} from './hooks/evaluations'
import { seedDefaultProgram } from './hooks/seedProgram'
import { backfillUserListTitles } from './hooks/users-backfill'
import { portalEmailAdapter } from './lib/email/adapter'
import { getServerURL } from './lib/env'
import { MAX_UPLOAD_BYTES } from './lib/upload'
import { r2Storage, r2SubmissionsStorage } from './storage/r2'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const serverURL = getServerURL()
const payloadSecret = process.env.PAYLOAD_SECRET?.trim()

if (!payloadSecret) {
  throw new Error('PAYLOAD_SECRET is required')
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        logout: {
          Component: '/components/Admin/AdminLogout#AdminLogout',
        },
      },
    },
    meta: {
      titleSuffix: ' — Spector Craft Prize',
    },
  },
  collections: [
    Users,
    Applicants,
    Programs,
    Applications,
    Evaluations,
    SubmissionFiles,
    Media,
    Documents,
    Editions,
    PrizeRecipients,
  ],
  globals: [Home, About, Press, EmergingArtistsPrize, Summit, Terms, Privacy, Navigation],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter((feature) => feature.key !== 'link'),
      LinkFeature({
        enabledCollections: ['editions', 'prize-recipients'],
        maxDepth: 2,
      }),
      FixedToolbarFeature(),
    ],
  }),
  email: portalEmailAdapter(),
  secret: payloadSecret,
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
  plugins: [r2Storage, r2SubmissionsStorage],
  onInit: async (payload) => {
    await seedDefaultProgram(payload)
    await backfillApplicationFileLinks(payload)
    await backfillApplicantIdentities(payload)
    await backfillApplicationListTitles(payload)
    await backfillUserListTitles(payload)
    await backfillEvaluationTotals(payload)
    await backfillEvaluationIdentities(payload)
    await backfillApplicationPanelGrades(payload)
  },
})
