import type { ReactNode } from 'react'

import { PORTAL_PATHS, SUPPORT_EMAIL } from '@/lib/portal'

import { LogoutButton } from './LogoutButton'
import { TextLink } from './ui'
import styles from './portal.module.css'

type PortalShellProps = {
  children: ReactNode
  helpHref?: string
  logoutHref?: string
  showLogout?: boolean
  title?: string
  userLabel?: string
}

export function PortalShell({
  children,
  helpHref,
  logoutHref = PORTAL_PATHS.login,
  showLogout = false,
  title = 'Spector Craft Prize for Emerging Artists',
  userLabel,
}: PortalShellProps) {
  const resolvedHelpHref =
    helpHref ??
    (title === 'Staff portal' || title === 'Jury portal'
      ? `mailto:${SUPPORT_EMAIL}`
      : PORTAL_PATHS.help)

  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#portal-main">
        Skip to content
      </a>
      <header className={styles.header}>
        <p className={styles.headerTitle}>{title}</p>
        <div className={styles.headerMeta}>
          {userLabel ? <span>{userLabel}</span> : null}
          {showLogout ? <LogoutButton redirectTo={logoutHref} /> : null}
          <TextLink href={resolvedHelpHref}>Help</TextLink>
          <TextLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</TextLink>
        </div>
      </header>
      <main className={styles.main} id="portal-main">
        {children}
      </main>
    </div>
  )
}
