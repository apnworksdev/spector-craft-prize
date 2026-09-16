import Link from 'next/link'

import { CmsRichText } from '@/components/CmsRichText/CmsRichText'
import { NewsletterForm } from '@/components/NewsletterForm/NewsletterForm'
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
        <NewsletterForm />
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
