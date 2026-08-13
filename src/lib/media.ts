import type { Media } from '@/payload-types'

export function mediaUrl(value: number | Media | null | undefined): string | null {
  if (!value || typeof value === 'number') {
    return null
  }

  return value.url ?? null
}

export function mediaAlt(value: number | Media | null | undefined, fallback = ''): string {
  if (!value || typeof value === 'number') {
    return fallback
  }

  return value.alt || fallback
}
