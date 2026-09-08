import Image from 'next/image'
import Link from 'next/link'

import logo from '@/assets/logo.png'

import styles from './SiteHeader.module.css'

const nav = [
  { href: '/2026-prize-recipients', label: 'Prize Recipients' },
  { href: '/emerging-artists-prize', label: 'Emerging Artists Prize' },
  { href: '/about', label: 'About' },
  { href: '/press', label: 'Press' },
]

export function SiteHeader() {
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
          {nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
