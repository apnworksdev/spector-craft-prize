import Link from 'next/link'

import { isExternalNavUrl } from '@/lib/navigation'
import { safeHref } from '@/lib/urls'

import styles from './AnnouncementBar.module.css'

export type AnnouncementBarProps = {
  text: string
  link?: string | null
  backgroundColor?: string | null
  textColor?: string | null
}

const DEFAULT_BG = '#F0F0F0'
const DEFAULT_FG = '#666666'

export function AnnouncementBar({
  text,
  link,
  backgroundColor,
  textColor,
}: AnnouncementBarProps) {
  const message = text.trim()
  if (!message) {
    return null
  }

  const href = link?.trim() ? safeHref(link.trim(), '') : ''
  const style = {
    backgroundColor: backgroundColor?.trim() || DEFAULT_BG,
    color: textColor?.trim() || DEFAULT_FG,
  }

  if (!href) {
    return (
      <div className={styles.bar} style={style}>
        <p className={styles.text}>{message}</p>
      </div>
    )
  }

  const external = isExternalNavUrl(href)

  if (external) {
    return (
      <a
        className={styles.bar}
        href={href}
        rel="noopener noreferrer"
        style={style}
        target="_blank"
      >
        <span className={styles.text}>{message}</span>
      </a>
    )
  }

  return (
    <Link className={styles.bar} href={href} style={style}>
      <span className={styles.text}>{message}</span>
    </Link>
  )
}
