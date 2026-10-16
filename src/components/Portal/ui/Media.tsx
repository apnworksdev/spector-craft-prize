import type { ReactNode } from 'react'

import styles from './ui.module.css'

export function MediaList({ children }: { children: ReactNode }) {
  return <div className={styles.mediaList}>{children}</div>
}

export function MediaRow({
  title,
  meta,
  details,
  actions,
  preview,
}: {
  title: ReactNode
  meta?: ReactNode
  details?: ReactNode
  actions?: ReactNode
  preview?: { kind: 'image' | 'video'; src: string } | null
}) {
  return (
    <div className={styles.mediaItem}>
      {preview?.kind === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className={styles.mediaPreview} decoding="async" loading="lazy" src={preview.src} />
      ) : null}
      {preview?.kind === 'video' ? (
        <video className={styles.mediaPreview} muted playsInline preload="metadata" src={preview.src} />
      ) : null}
      <div className={styles.mediaItemText}>
        <strong>{title}</strong>
        {meta ? <span>{meta}</span> : null}
        {details ? <span>{details}</span> : null}
      </div>
      {actions ? <div className={styles.mediaItemActions}>{actions}</div> : null}
    </div>
  )
}

export function MediaGallery({
  items,
}: {
  items: Array<{ src: string; alt: string }>
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className={styles.mediaGallery}>
      {items.map((item) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={item.alt}
          className={styles.mediaGalleryImage}
          decoding="async"
          key={item.src}
          loading="lazy"
          src={item.src}
        />
      ))}
    </div>
  )
}

export function MediaPlayer({ src }: { src: string }) {
  return <video className={styles.mediaPlayer} controls playsInline preload="metadata" src={src} />
}
