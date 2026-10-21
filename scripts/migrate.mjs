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
  // Pipe stdin so we can answer Payload's "dev mode push" confirm in CI.
  stdio: ['pipe', 'inherit', 'inherit'],
  env: process.env,
  shell: true,
})

// Dev DBs often have a payload-migrations row with batch=-1 from `push: true`.
// Payload then asks whether to proceed; Netlify has no TTY, so auto-accept.
child.stdin.write('y\n')
child.stdin.end()

child.on('exit', (code) => {
  process.exit(code ?? 1)
})
