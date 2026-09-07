import Link from 'next/link'

import styles from './SiteFooter.module.css'

const primaryNav = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/press', label: 'Press' },
  { href: '/emerging-artists-prize', label: 'Emerging Artists Prize' },
  { href: '/summit', label: 'Summit' },
  { href: '/faq', label: 'FAQ' },
]

const legalNav = [
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/privacy', label: 'Privacy Policy' },
]

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.subscribe}>
        <p className={styles.subscribeCopy}>
          Subscribe to our newsletter to get the latest news on the Spector Craft Prize
        </p>
        <form className={styles.form} action="#" method="post">
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input
            className={styles.email}
            id="newsletter-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email address"
            required
          />
          <button className={styles.submit} type="submit">
            Submit
          </button>
        </form>
      </div>

      <nav aria-label="Footer" className={styles.nav}>
        <ul className={styles.navList}>
          {primaryNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <ul className={styles.navList}>
          {legalNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  )
}
