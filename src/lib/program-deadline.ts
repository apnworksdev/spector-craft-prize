const DAY_MS = 24 * 60 * 60 * 1000
const ANYWHERE_ON_EARTH_OFFSET_MS = 12 * 60 * 60 * 1000

type ProgramWindow = {
  status?: string | null
  deadline?: string | null
}

// The deadline day closes at 23:59 "anywhere on Earth" (UTC−12), so no US time zone loses part of the last day.
export function programDeadlinePassed(deadline: string | null | undefined, now = new Date()) {
  if (!deadline) {
    return false
  }

  const date = new Date(deadline)
  if (Number.isNaN(date.getTime())) {
    return false
  }

  const dayStart = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return now.getTime() >= dayStart + DAY_MS + ANYWHERE_ON_EARTH_OFFSET_MS
}

export function programAcceptsSubmissions(program: ProgramWindow | null | undefined, now = new Date()) {
  return program?.status === 'live' && !programDeadlinePassed(program.deadline, now)
}
