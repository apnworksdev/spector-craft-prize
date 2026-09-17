import { safeHref } from '@/lib/urls'

export type NavLinkItem = {
  label: string
  url: string
  openInNewTab?: boolean | null
}

type NavLinkInput = {
  label?: string | null
  url?: string | null
  openInNewTab?: boolean | null
  file?: number | { url?: string | null } | null
} | null

export const DEFAULT_HEADER_NAV: NavLinkItem[] = [
  { label: '2026 Prize Recipients', url: '/2026-prize-recipients' },
  { label: 'Emerging Artists Prize', url: '/emerging-artists-prize' },
  { label: 'About', url: '/about' },
  { label: 'Press', url: '/press' },
]

export const DEFAULT_FOOTER_PRIMARY_NAV: NavLinkItem[] = [
  { label: 'Home', url: '/' },
  { label: '2026 Prize Recipients', url: '/2026-prize-recipients' },
  { label: 'Emerging Artists Prize', url: '/emerging-artists-prize' },
  { label: 'About', url: '/about' },
  { label: 'Press', url: '/press' },
]

export const DEFAULT_FOOTER_LEGAL_NAV: NavLinkItem[] = [
  { label: 'Terms & Conditions', url: '/terms' },
  { label: 'Privacy Policy', url: '/privacy' },
]

export function isExternalNavUrl(url: string): boolean {
  return /^(https?:)?\/\//i.test(url) || /\.pdf(?:$|\?)/i.test(url)
}

function resolveNavUrl(item: NonNullable<NavLinkInput>): string | null {
  if (item.file && typeof item.file === 'object' && item.file.url) {
    const url = safeHref(item.file.url, '')
    return url || null
  }

  if (item.url?.trim()) {
    const url = safeHref(item.url, '')
    return url || null
  }

  return null
}

export function normalizeNavLinks(
  items: NavLinkInput[] | null | undefined,
  fallback: NavLinkItem[],
): NavLinkItem[] {
  const links: NavLinkItem[] = []

  for (const item of items ?? []) {
    if (!item?.label) {
      continue
    }

    const url = resolveNavUrl(item)
    if (!url) {
      continue
    }

    const fromFile = Boolean(item.file && typeof item.file === 'object' && item.file.url)

    links.push({
      label: item.label.trim(),
      url,
      openInNewTab: Boolean(item.openInNewTab) || fromFile,
    })
  }

  return links.length ? links : fallback
}
