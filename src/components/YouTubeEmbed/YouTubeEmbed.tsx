import { youtubeEmbedSrc } from '@/lib/youtube'

import styles from './YouTubeEmbed.module.css'

type YouTubeEmbedProps = {
  url: string
  className?: string
  title?: string
}

export function YouTubeEmbed({ url, className, title = 'YouTube video' }: YouTubeEmbedProps) {
  const src = youtubeEmbedSrc(url)

  if (!src) {
    return null
  }

  return (
    <iframe
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className={`${styles.embed}${className ? ` ${className}` : ''}`}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      src={src}
      title={title}
    />
  )
}
