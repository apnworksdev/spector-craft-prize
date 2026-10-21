'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

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

function ImageLightbox({
  alt,
  onClose,
  src,
}: {
  alt: string
  onClose: () => void
  src: string
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [])

  return (
    <div
      className={styles.lightbox}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div aria-label={alt || 'Expanded image'} aria-modal="true" className={styles.lightboxDialog} role="dialog">
        <button className={styles.lightboxClose} onClick={onClose} ref={closeRef} type="button">
          Close
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={alt} className={styles.lightboxImage} src={src} />
      </div>
    </div>
  )
}

export function MediaGallery({
  items,
}: {
  items: Array<{ src: string; alt: string }>
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (items.length === 0) {
    return null
  }

  const active = activeIndex == null ? null : items[activeIndex]

  return (
    <>
      <div className={styles.mediaGallery}>
        {items.map((item, index) => (
          <button
            aria-label={item.alt ? `View ${item.alt} larger` : 'View image larger'}
            className={styles.mediaGalleryButton}
            key={item.src}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              className={styles.mediaGalleryImage}
              decoding="async"
              loading="lazy"
              src={item.src}
            />
          </button>
        ))}
      </div>
      {active ? (
        <ImageLightbox alt={active.alt} onClose={() => setActiveIndex(null)} src={active.src} />
      ) : null}
    </>
  )
}

export function MediaPlayer({ src }: { src: string }) {
  return <video className={styles.mediaPlayer} controls playsInline preload="metadata" src={src} />
}
