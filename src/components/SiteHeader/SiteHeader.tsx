import Image from 'next/image'
import Link from 'next/link'

import logo from '@/assets/logo.png'
import { isExternalNavUrl, type NavLinkItem } from '@/lib/navigation'

import styles from './SiteHeader.module.css'

type SiteHeaderProps = {
  items: NavLinkItem[]
}

export function SiteHeader({ items }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <Link className={styles.mark} href="/">
        <Image
          src={logo}
          alt="Spector Craft Prize logo"
          width={1024}
          height={143}
          priority
          className={styles.logo}
        />
      </Link>
      <nav aria-label="Primary" className={styles.nav}>
        <ul className={styles.navList}>
          {items.map((item) => (
            <li key={`${item.label}-${item.url}`}>
              <NavLink item={item} />
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

function NavLink({ item }: { item: NavLinkItem }) {
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
    <Link className={styles.navLink} href={item.url}>
      {item.label}
    </Link>
  )
}
