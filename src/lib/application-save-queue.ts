'use client'

import { updateApplicationFields } from '@/lib/portal-actions'
import type { Application } from '@/payload-types'

let pending: Promise<void> = Promise.resolve()

export function enqueueApplicationSave(applicationId: number, data: Partial<Application>) {
  const run = pending.then(() => updateApplicationFields(applicationId, data))
  pending = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}
