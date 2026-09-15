import Link from 'next/link'

import { CmsRichText } from '@/components/CmsRichText/CmsRichText'
import { isExternalNavUrl, type NavLinkItem } from '@/lib/navigation'
import { hasLexicalText } from '@/lib/richText'
import type { Navigation } from '@/payload-types'

import styles from './SiteFooter.module.css'

type SiteFooterProps = {
  primary: NavLinkItem[]
  legal: NavLinkItem[]
  credits?: Navigation['footerCredits']
}

export function SiteFooter({ primary, legal, credits }: SiteFooterProps) {
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

      <div className={styles.bottom}>
        {hasLexicalText(credits) ? <CmsRichText className={styles.credits} data={credits} /> : null}
        <nav aria-label="Footer" className={styles.nav}>
          <ul className={styles.navList}>
            {primary.map((item) => (
              <li key={`${item.label}-${item.url}`}>
                <NavLink item={item} />
              </li>
            ))}
          </ul>
          <ul className={styles.navList}>
            {legal.map((item) => (
              <li key={`${item.label}-${item.url}`}>
                <NavLink item={item} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
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
