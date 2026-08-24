import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/SiteFooter/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader/SiteHeader'
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
