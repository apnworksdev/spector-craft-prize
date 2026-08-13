import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/SiteFooter/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader/SiteHeader'
import { PageShell } from '@/components/PageShell/PageShell'
import '@/css/global.css'

export const metadata = {
  description: 'Spector Craft Prize',
  title: 'Spector Craft Prize',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageShell>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </PageShell>
      </body>
    </html>
  )
}
