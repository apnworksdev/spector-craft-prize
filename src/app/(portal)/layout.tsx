import type { ReactNode } from 'react'

import '@/css/variables.css'
import '@/css/global.css'
import '@/css/main.css'

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function PortalRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
