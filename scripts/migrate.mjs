import { spawn } from 'node:child_process'

import dotenv from 'dotenv'

dotenv.config()

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
