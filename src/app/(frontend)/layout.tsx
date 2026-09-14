import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/SiteFooter/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader/SiteHeader'
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

export const metadata = {
  description: 'Spector Craft Prize',
  title: 'Spector Craft Prize',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const navigation = await getCachedGlobal('navigation', 1)
  const header = normalizeNavLinks(navigation.header, DEFAULT_HEADER_NAV)
  const footerPrimary = normalizeNavLinks(navigation.footerPrimary, DEFAULT_FOOTER_PRIMARY_NAV)
  const footerLegal = normalizeNavLinks(navigation.footerLegal, DEFAULT_FOOTER_LEGAL_NAV)

  return (
    <html lang="en">
      <body>
        <SiteHeader items={header} />
        <main>{children}</main>
        <SiteFooter legal={footerLegal} primary={footerPrimary} />
      </body>
    </html>
  )
}
