import Link from 'next/link'
import type { ReactNode } from 'react'

import { cx } from './cx'
import styles from './ui.module.css'

type TextLinkProps = {
  href: string
  children: ReactNode
  active?: boolean
  className?: string
}

function isExternal(href: string) {
  return /^(https?:|mailto:|tel:)/.test(href) || href.startsWith('/api/')
}

export function TextLink({ href, children, active = false, className }: TextLinkProps) {
  const classNames = cx(active ? styles.linkActive : styles.link, className)
  const current = active ? 'page' : undefined

  if (isExternal(href)) {
    return (
      <a aria-current={current} className={classNames} href={href}>
        {children}
      </a>
    )
  }

  return (
    <Link aria-current={current} className={classNames} href={href}>
      {children}
    </Link>
  )
}
