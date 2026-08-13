import Link from 'next/link'

import styles from './SiteHeader.module.css'

const nav = [
  { href: '/', label: 'Home' },
  { href: '/2026-prize-recipients', label: 'Prize Recipients' },
  { href: '/emerging-artists-prize', label: 'Emerging Artists Prize' },
  { href: '/about', label: 'About' },
  { href: '/press', label: 'Press' },
]

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.mark} href="/">
        Spector Craft Prize
      </Link>
      <nav aria-label="Primary">
        <ul className={styles.nav}>
          {nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
