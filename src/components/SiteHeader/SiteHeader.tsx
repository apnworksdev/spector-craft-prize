'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useState } from 'react'

import logo from '@/assets/logo.png'

import styles from './SiteHeader.module.css'

const nav = [
  { href: '/2026-prize-recipients', label: 'Prize Recipients' },
  { href: '/emerging-artists-prize', label: 'Emerging Artists Prize' },
  { href: '/summit', label: 'Summit' },
  { href: '/about', label: 'About' },
  { href: '/press', label: 'Press' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const menuId = useId()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const root = document.documentElement

    if (open) {
      root.classList.add('menu-open')
    } else {
      root.classList.remove('menu-open')
    }

    return () => {
      root.classList.remove('menu-open')
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className={`${styles.header}${open ? ` ${styles.open}` : ''}`}>
      <Link className={styles.mark} href="/" onClick={() => setOpen(false)}>
        <Image
          src={logo}
          alt="Spector Craft Prize logo"
          width={1024}
          height={143}
          priority
          className={styles.logo}
        />
      </Link>
      <button
        aria-controls={menuId}
        aria-expanded={open}
        className={styles.menuButton}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {open ? 'Close' : 'Menu'}
      </button>
      <nav aria-label="Primary" className={styles.nav} id={menuId}>
        <ul className={styles.navList}>
          {nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.navLink} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
