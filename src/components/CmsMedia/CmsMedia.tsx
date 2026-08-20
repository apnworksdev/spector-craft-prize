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
}

export function CmsMedia({
  value,
  size = 'card',
  fallbackAlt = '',
  className,
  sizes,
  priority,
}: CmsMediaProps) {
  if (isVideo(value)) {
    const src = mediaSrc(value)

    if (!src) {
      return null
    }

    return (
      <video
        aria-label={mediaAlt(value, fallbackAlt)}
        className={className}
        controls
        playsInline
        preload="none"
        src={src}
      />
    )
  }

  return (
    <CmsImage
      className={className}
      fallbackAlt={fallbackAlt}
      priority={priority}
      size={size}
      sizes={sizes}
      value={value}
    />
  )
}

