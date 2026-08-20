import Image from 'next/image'

import { mediaAlt, mediaImage, type MediaSizeName } from '@/lib/media'
import type { Media } from '@/payload-types'

type CmsImageProps = {
  value: number | Media | null | undefined
  size?: MediaSizeName
  fallbackAlt?: string
  className?: string
  sizes: string
  priority?: boolean
}

export function CmsImage({
  value,
  size = 'card',
  fallbackAlt = '',
  className,
  sizes,
  priority,
}: CmsImageProps) {
  const image = mediaImage(value, size)

  if (!image) {
    return null
  }

  return (
    <Image
      alt={image.alt || mediaAlt(value, fallbackAlt)}
      className={className}
      height={image.height}
      priority={priority}
      sizes={sizes}
      src={image.src}
      width={image.width}
    />
  )
}
