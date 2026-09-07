import { spawn } from 'node:child_process'

import dotenv from 'dotenv'

dotenv.config()

// Netlify runs `pnpm migrate` before `next build`. Without this, Payload
// treats the DB as local (push mode) and hangs on an interactive prompt.
process.env.NODE_ENV = 'production'

if (process.env.DATABASE_MIGRATE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_MIGRATE_URL
}

const child = spawn('pnpm', ['exec', 'payload', 'migrate'], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
})

child.on('exit', (code) => {
  process.exit(code ?? 1)
})
