import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import dotenv from 'dotenv'

dotenv.config()

// Netlify runs `pnpm migrate` before `next build`. Without this, Payload
// treats the DB as local (push mode) and hangs on an interactive prompt.
process.env.NODE_ENV = 'production'

if (process.env.DATABASE_MIGRATE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_MIGRATE_URL
}

const require = createRequire(import.meta.url)

function loadPg() {
  try {
    return require('pg')
  } catch {
    // pnpm nests pg under other packages; find it for CI.
  }

  const pnpmDir = path.join(process.cwd(), 'node_modules/.pnpm')
  if (!fs.existsSync(pnpmDir)) {
    throw new Error('pg module not found')
  }

  for (const entry of fs.readdirSync(pnpmDir)) {
    if (!entry.startsWith('pg@')) {
      continue
    }

    const candidate = path.join(pnpmDir, entry, 'node_modules/pg')
    if (fs.existsSync(candidate)) {
      return require(candidate)
    }
  }

  throw new Error('pg module not found')
}

function loadMigrationNames() {
  const indexPath = path.join(process.cwd(), 'src/migrations/index.ts')
  const source = fs.readFileSync(indexPath, 'utf8')
  return [...source.matchAll(/name:\s*['"]([^'"]+)['"]/g)].map((match) => match[1])
}

async function reconcilePushedSchemaHistory() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    return
  }

  // Local/dev often uses `push: true`. That leaves either:
  // - payload_migrations.batch = -1 (interactive prompt on Netlify), or
  // - incomplete migration history (migrate tries to CREATE tables that already exist).
  // Production that migrated normally has the first migration recorded and no -1 batch.
  const { Client } = loadPg()
  const client = new Client({ connectionString })

  try {
    await client.connect()

    const names = loadMigrationNames()
    if (names.length === 0) {
      return
    }

    const users = await client.query(`SELECT to_regclass('public.users') AS table_name`)
    if (!users.rows[0]?.table_name) {
      return
    }

    const firstRecorded = await client.query(
      `SELECT 1 FROM payload_migrations WHERE name = $1 LIMIT 1`,
      [names[0]],
    )
    const devMarker = await client.query(
      `SELECT 1 FROM payload_migrations WHERE batch = -1 LIMIT 1`,
    )

    if (firstRecorded.rowCount > 0 && devMarker.rowCount === 0) {
      return
    }

    await client.query('BEGIN')
    await client.query(`DELETE FROM payload_migrations WHERE batch = -1`)

    let inserted = 0
    for (const name of names) {
      const result = await client.query(
        `INSERT INTO payload_migrations (name, batch, updated_at, created_at)
         SELECT $1::varchar, 1, NOW(), NOW()
         WHERE NOT EXISTS (
           SELECT 1 FROM payload_migrations WHERE name = $1::varchar
         )
         RETURNING id`,
        [name],
      )
      inserted += result.rowCount
    }

    await client.query('COMMIT')
    console.log(
      `Reconciled pushed schema history: recorded ${inserted} migration(s) as already applied.`,
    )
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // ignore
    }
    console.warn(
      'Could not reconcile Payload migration history (continuing):',
      error instanceof Error ? error.message : error,
    )
  } finally {
    await client.end().catch(() => undefined)
  }
}

await reconcilePushedSchemaHistory()

const child = spawn('pnpm', ['exec', 'payload', 'migrate'], {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code) => {
  process.exit(code ?? 1)
})
