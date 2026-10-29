import type { ReactNode } from 'react'

import { AnnouncementBar } from '@/components/AnnouncementBar/AnnouncementBar'
import { NewsletterPopup } from '@/components/NewsletterPopup/NewsletterPopup'
import { SiteFooter } from '@/components/SiteFooter/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader/SiteHeader'
import { getServerURL } from '@/lib/env'
import { getCachedGlobal } from '@/lib/cms'
import {
  DEFAULT_FOOTER_LEGAL_NAV,
  DEFAULT_FOOTER_PRIMARY_NAV,
  DEFAULT_HEADER_NAV,
  normalizeNavLinks,
} from '@/lib/navigation'
import '@/css/variables.css'
import '@/css/global.css'
import '@/css/main.css'

export const revalidate = 60

export const metadata = {
  metadataBase: new URL(getServerURL()),
  description: 'Spector Craft Prize',
  title: 'Spector Craft Prize',
  openGraph: {
    type: 'website',
    siteName: 'Spector Craft Prize',
    locale: 'en_US',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [navigation, announcement] = await Promise.all([
    getCachedGlobal('navigation', 1),
    getCachedGlobal('announcement-bar', 0),
  ])
  const header = normalizeNavLinks(navigation.header, DEFAULT_HEADER_NAV)
  const footerPrimary = normalizeNavLinks(navigation.footerPrimary, DEFAULT_FOOTER_PRIMARY_NAV)
  const footerLegal = normalizeNavLinks(navigation.footerLegal, DEFAULT_FOOTER_LEGAL_NAV)

  return (
    <html lang="en">
      <body>
        {announcement.active && announcement.text?.trim() ? (
          <AnnouncementBar
            backgroundColor={announcement.backgroundColor}
            link={announcement.link}
            text={announcement.text}
            textColor={announcement.textColor}
          />
        ) : null}
        <SiteHeader items={header} />
        <main>{children}</main>
        <SiteFooter credits={navigation.footerCredits} legal={footerLegal} primary={footerPrimary} />
        <NewsletterPopup />
      </body>
    </html>
  )
}
