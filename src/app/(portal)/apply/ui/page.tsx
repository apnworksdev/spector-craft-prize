import type { Metadata } from 'next'

import { PortalShell } from '@/components/Portal/PortalShell'

import { ComponentGallery } from './ComponentGallery'

export const metadata: Metadata = {
  title: 'Components',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ComponentGalleryPage() {
  return (
    <PortalShell title="Component styles">
      <ComponentGallery />
    </PortalShell>
  )
}
