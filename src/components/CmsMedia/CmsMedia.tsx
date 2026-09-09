import styles from './CmsMedia.module.css'
import { CmsImage } from '@/components/CmsImage/CmsImage'
import { isVideo, mediaAlt, mediaSrc, type MediaSizeName } from '@/lib/media'
import type { Media } from '@/payload-types'

type CmsMediaProps = {
  value: number | Media | null | undefined
  size?: MediaSizeName
  fallbackAlt?: string
  className?: string
  sizes: string
  priority?: boolean
  href?: string | null
}

export function CmsMedia({
  value,
  size = 'card',
  fallbackAlt = '',
  className,
  sizes,
  priority,
  href,
}: CmsMediaProps) {
  if (isVideo(value)) {
    const src = mediaSrc(value)

    if (!src) {
      return null
    }

    const video = (
      <video
        aria-label={mediaAlt(value, fallbackAlt)}
        className={href ? styles.fill : className}
        controls
        playsInline
        preload="none"
        src={src}
      />
    )

    if (!href) {
      return video
    }

    return (
      <a
        className={`${styles.link}${className ? ` ${className}` : ''}`}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {video}
      </a>
    )
  }

  return (
    <CmsImage
      className={className}
      fallbackAlt={fallbackAlt}
      href={href}
      priority={priority}
      size={size}
      sizes={sizes}
      value={value}
    />
  )
}
