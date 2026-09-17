'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import logo from '@/assets/logo.png'
import { isExternalNavUrl, type NavLinkItem } from '@/lib/navigation'

import styles from './SiteHeader.module.css'

type SiteHeaderProps = {
  items: NavLinkItem[]
}

export function SiteHeader({ items }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Link className={styles.mark} href="/" onClick={() => setOpen(false)}>
          <Image
            src={logo}
            alt="Spector Craft Prize logo"
            width={1024}
            height={143}
            className={styles.logo}
          />
        </Link>
        <button
          aria-controls="site-menu"
          aria-expanded={open}
          className={styles.menuToggle}
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          Menu
        </button>
      </div>
      <nav
        aria-label="Primary"
        className={`${styles.nav}${open ? ` ${styles.navOpen}` : ''}`}
        id="site-menu"
      >
        <ul className={styles.navList}>
          {items.map((item) => (
            <li key={`${item.label}-${item.url}`}>
              <NavLink item={item} onNavigate={() => setOpen(false)} />
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

function NavLink({ item, onNavigate }: { item: NavLinkItem; onNavigate: () => void }) {
  const external = item.openInNewTab || isExternalNavUrl(item.url)

  if (external) {
    return (
      <a
        className={styles.navLink}
        href={item.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        {item.label}
      </a>
    )
  }

  return (
    <Link className={styles.navLink} href={item.url} onClick={onNavigate}>
      {item.label}
    </Link>
  )
}
