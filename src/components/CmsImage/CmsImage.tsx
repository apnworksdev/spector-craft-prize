import Image from 'next/image'

import styles from '@/components/CmsMedia/CmsMedia.module.css'
import { mediaAlt, mediaImage, type MediaSizeName } from '@/lib/media'
import type { Media } from '@/payload-types'

type CmsImageProps = {
  value: number | Media | null | undefined
  size?: MediaSizeName
  fallbackAlt?: string
  className?: string
  sizes: string
  priority?: boolean
  href?: string | null
}

export function CmsImage({
  value,
  size,
  fallbackAlt = '',
  className,
  sizes,
  priority,
  href,
}: CmsImageProps) {
  const image = mediaImage(value, size)

  if (!image) {
    return null
  }

  const img = (
    <Image
      alt={image.alt || mediaAlt(value, fallbackAlt)}
      className={href ? styles.fill : className}
      height={image.height}
      priority={priority}
      sizes={sizes}
      src={image.src}
      width={image.width}
    />
  )

  if (!href) {
    return img
  }

  return (
    <a
      className={`${styles.link}${className ? ` ${className}` : ''}`}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {img}
    </a>
  )
}
