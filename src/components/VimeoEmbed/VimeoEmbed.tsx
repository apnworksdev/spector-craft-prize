'use client'

import type Player from '@vimeo/player'
import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from 'react'

import { vimeoEmbedSrc, vimeoVideoRef } from '@/lib/vimeo'

import styles from './VimeoEmbed.module.css'

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
}

type FullscreenNode = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
}

type OverflowUnlock = {
  el: HTMLElement
  overflow: string
}

function unlockAncestorOverflow(node: HTMLElement) {
  const previous: OverflowUnlock[] = []
  let el: HTMLElement | null = node.parentElement

  while (el && el !== document.documentElement) {
    const style = getComputedStyle(el)
    if (style.overflow !== 'visible' || style.overflowX !== 'visible' || style.overflowY !== 'visible') {
      previous.push({ el, overflow: el.style.overflow })
      el.style.setProperty('overflow', 'visible', 'important')
    }
    el = el.parentElement
  }

  return previous
}

function restoreAncestorOverflow(previous: OverflowUnlock[]) {
  for (const item of previous) {
    if (item.overflow) {
      item.el.style.overflow = item.overflow
    } else {
      item.el.style.removeProperty('overflow')
    }
  }
}

function isPlayerFullscreen(data: unknown) {
  if (typeof data === 'boolean') {
    return data
  }

  if (data && typeof data === 'object' && 'fullscreen' in data) {
    return Boolean((data as { fullscreen?: unknown }).fullscreen)
  }

  return false
}

function ignoreUnloadedPlayerRejections() {
  const view = window as Window & { __spectorVimeoUnloadGuard?: boolean }
  if (view.__spectorVimeoUnloadGuard) {
    return
  }

  view.__spectorVimeoUnloadGuard = true
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason instanceof Error ? event.reason.message : String(event.reason ?? '')
    if (message.includes('Unknown player. Probably unloaded')) {
      event.preventDefault()
    }
  })
}

function isIOS() {
  if (typeof navigator === 'undefined') {
    return false
  }

  return /iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function setIframePointerEvents(container: HTMLElement | null, enabled: boolean) {
  const iframe = container?.querySelector('iframe')
  if (iframe) {
    iframe.style.pointerEvents = enabled ? 'auto' : ''
  }
}

function getFullscreenElement() {
  const doc = document as FullscreenDocument
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null
}

async function requestNativeFullscreen(node: HTMLElement) {
  const target = node as FullscreenNode
  if (target.requestFullscreen) {
    await target.requestFullscreen()
    return
  }

  if (target.webkitRequestFullscreen) {
    await Promise.resolve(target.webkitRequestFullscreen())
    return
  }

  throw new Error('Fullscreen API unavailable')
}

async function exitNativeFullscreen() {
  const doc = document as FullscreenDocument
  if (document.exitFullscreen && document.fullscreenElement) {
    await document.exitFullscreen()
    return
  }

  if (doc.webkitExitFullscreen && doc.webkitFullscreenElement) {
    await Promise.resolve(doc.webkitExitFullscreen())
  }
}

type VimeoEmbedProps = {
  url: string
  className?: string
  title?: string
  /** Progress bar. Defaults on for all embeds. */
  progress?: boolean
  /** Tighter controls for portrait videos. */
  compact?: boolean
}

export function VimeoEmbed({
  url,
  className,
  title = 'Vimeo video',
  progress = true,
  compact = false,
}: VimeoEmbedProps) {
  const video = vimeoVideoRef(url)
  const playerShellRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)
  const overflowUnlocksRef = useRef<OverflowUnlock[]>([])
  const cssExpandedRef = useRef(false)
  const draggingRef = useRef(false)
  const [ready, setReady] = useState(false)
  const [inView, setInView] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [cssExpanded, setCssExpanded] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const shell = playerShellRef.current
    if (!shell) {
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 },
    )

    observer.observe(shell)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const src = vimeoEmbedSrc(url)
    if (!inView || !container || !video || !src) {
      return
    }

    ignoreUnloadedPlayerRejections()

    let cancelled = false
    container.replaceChildren()

    const iframe = document.createElement('iframe')
    iframe.src = src
    iframe.title = title
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media'
    iframe.setAttribute('allowfullscreen', '')
    iframe.setAttribute('webkitallowfullscreen', 'true')
    iframe.setAttribute('playsinline', 'true')
    container.appendChild(iframe)

    let player: Player | null = null

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onVolumeChange = (data: { muted: boolean }) => setMuted(data.muted)
    const onTimeUpdate = (data: { seconds?: number; duration?: number }) => {
      if (draggingRef.current) {
        return
      }
      if (typeof data.seconds === 'number') {
        setCurrentTime(data.seconds)
      }
      if (data.duration) {
        setDuration(data.duration)
      }
    }

    let tornDown = false
    const safeDestroy = () => {
      if (tornDown) {
        return
      }

      tornDown = true
      playerRef.current = null
      if (player) {
        void player.destroy().catch(() => undefined)
      }
      iframe.remove()
    }

    void import('@vimeo/player')
      .then(({ default: Player }) => {
        if (cancelled) {
          safeDestroy()
          return
        }

        player = new Player(iframe)
        playerRef.current = player
        setReady(false)
        setDuration(0)
        setCurrentTime(0)

        return player.ready().then(async () => {
        if (cancelled || !player) {
          safeDestroy()
          return
        }

        player.on('play', onPlay)
        player.on('pause', onPause)
        player.on('volumechange', onVolumeChange)
        player.on('fullscreenchange', (data: unknown) => {
          const on = isPlayerFullscreen(data)
          setIframePointerEvents(container, on)
          if (on) {
            cssExpandedRef.current = false
            setCssExpanded(false)
            setExpanded(true)
            return
          }

          if (!cssExpandedRef.current) {
            setExpanded(false)
          }
        })
        if (progress) {
          player.on('timeupdate', onTimeUpdate)
        }

        try {
          const [isMuted, length, seconds] = await Promise.all([
            player.getMuted(),
            progress ? player.getDuration() : Promise.resolve(0),
            progress ? player.getCurrentTime() : Promise.resolve(0),
          ])
          if (cancelled) {
            safeDestroy()
            return
          }

          setMuted(isMuted)
          if (progress) {
            setDuration(length)
            setCurrentTime(seconds)
          }

          const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

          try {
            if (reduceMotion) {
              setPlaying(false)
            } else {
              await player.play()
              if (!cancelled) {
                setPlaying(true)
              }
            }
          } catch {
            if (!cancelled) {
              const isPaused = await player.getPaused().catch(() => true)
              setPlaying(!isPaused)
            }
          }

          if (!cancelled) {
            setReady(true)
          }
        } catch {
          if (cancelled) {
            safeDestroy()
            return
          }

          setReady(false)
        }
        })
      })
      .catch(() => {
        if (cancelled) {
          safeDestroy()
          return
        }

        setReady(false)
      })

    return () => {
      cancelled = true
      safeDestroy()
    }
  }, [inView, progress, title, url, video?.hash, video?.id])

  useEffect(() => {
    const onFullscreenChange = () => {
      const shell = playerShellRef.current
      const active = getFullscreenElement()
      if (shell && active === shell) {
        setExpanded(true)
        setCssExpanded(false)
        return
      }

      if (!active && !cssExpandedRef.current) {
        setExpanded(false)
      }
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', onFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
    }
  }, [])

  useEffect(() => {
    cssExpandedRef.current = cssExpanded
    const shell = playerShellRef.current
    if (!cssExpanded || !shell) {
      restoreAncestorOverflow(overflowUnlocksRef.current)
      overflowUnlocksRef.current = []
      return
    }

    overflowUnlocksRef.current = unlockAncestorOverflow(shell)
    return () => {
      restoreAncestorOverflow(overflowUnlocksRef.current)
      overflowUnlocksRef.current = []
    }
  }, [cssExpanded])

  useEffect(() => {
    if (!expanded) {
      return
    }

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        void exitExpanded()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [expanded])

  if (!video) {
    return null
  }

  const togglePlay = async () => {
    const player = playerRef.current
    if (!player) {
      return
    }

    try {
      const isPaused = await player.getPaused()
      if (isPaused) {
        await player.play()
        setPlaying(true)
      } else {
        await player.pause()
        setPlaying(false)
      }
    } catch {
      return
    }
  }

  const toggleMute = async () => {
    const player = playerRef.current
    if (!player) {
      return
    }

    try {
      const nextMuted = !(await player.getMuted())
      await player.setMuted(nextMuted)
      if (!nextMuted) {
        await player.setVolume(1)
      }
      setMuted(nextMuted)
    } catch {
      return
    }
  }

  const exitExpanded = async () => {
    const player = playerRef.current
    if (player) {
      try {
        const isFs = await player.getFullscreen().catch(() => false)
        if (isFs) {
          await player.exitFullscreen()
        }
      } catch {
        // Keep going so the CSS fallback can close.
      }
    }

    const active = getFullscreenElement()
    if (active) {
      await exitNativeFullscreen()
    }
    setIframePointerEvents(containerRef.current, false)
    setCssExpanded(false)
    cssExpandedRef.current = false
    setExpanded(false)
  }

  const toggleFullscreen = async () => {
    const shell = playerShellRef.current
    const player = playerRef.current
    const container = containerRef.current
    if (!shell) {
      return
    }

    if (expanded || cssExpanded || getFullscreenElement() === shell) {
      await exitExpanded()
      return
    }

    if (isIOS() && player) {
      try {
        setIframePointerEvents(container, true)
        await player.requestFullscreen()
        const isFs = await player.getFullscreen().catch(() => false)
        if (isFs) {
          setExpanded(true)
          return
        }
      } catch {
        // Fall through to the wrapper / CSS fullscreen.
      }
      setIframePointerEvents(container, false)
    }

    try {
      await requestNativeFullscreen(shell)
      if (getFullscreenElement() === shell) {
        setExpanded(true)
        return
      }
    } catch {
      // iOS Safari doesn't fullscreen arbitrary elements.
    }

    cssExpandedRef.current = true
    setCssExpanded(true)
    setExpanded(true)
  }

  const seekTo = async (seconds: number) => {
    const player = playerRef.current
    if (!player || !duration) {
      return
    }

    const next = Math.min(duration, Math.max(0, seconds))
    setCurrentTime(next)
    try {
      await player.setCurrentTime(next)
    } catch {
      return
    }
  }

  const seekFromClientX = (clientX: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect()
    if (!rect.width) {
      return
    }

    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    void seekTo(ratio * duration)
  }

  const onProgressPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!ready || duration <= 0) {
      return
    }

    event.preventDefault()
    draggingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    seekFromClientX(event.clientX, event.currentTarget)
  }

  const onProgressPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) {
      return
    }

    seekFromClientX(event.clientX, event.currentTarget)
  }

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) {
      return
    }

    draggingRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const onProgressKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!ready || duration <= 0) {
      return
    }

    const step = event.shiftKey ? 10 : 5
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault()
      void seekTo(currentTime + step)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      void seekTo(currentTime - step)
    } else if (event.key === 'Home') {
      event.preventDefault()
      void seekTo(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      void seekTo(duration)
    }
  }

  const percent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  return (
    <div
      className={`${styles.player}${compact ? ` ${styles.compact}` : ''}${cssExpanded ? ` ${styles.expanded}` : ''}${className ? ` ${className}` : ''}`}
      ref={playerShellRef}
      title={title}
    >
      <div className={styles.frame} ref={containerRef} />
      <div className={styles.controls}>
        {progress ? (
          <div
            aria-disabled={!ready || duration <= 0}
            aria-label="Seek"
            aria-valuemax={Math.round(duration)}
            aria-valuemin={0}
            aria-valuenow={Math.round(currentTime)}
            className={styles.progress}
            onKeyDown={onProgressKeyDown}
            onLostPointerCapture={endDrag}
            onPointerCancel={endDrag}
            onPointerDown={onProgressPointerDown}
            onPointerMove={onProgressPointerMove}
            onPointerUp={endDrag}
            role="slider"
            tabIndex={ready && duration > 0 ? 0 : -1}
          >
            <span className={styles.progressTrack}>
              <span className={styles.progressFill} style={{ width: `${percent}%` }} />
            </span>
          </div>
        ) : null}
        <div className={styles.buttons}>
          <button
            aria-label={playing ? 'Pause' : 'Play'}
            className={styles.control}
            disabled={!ready}
            onClick={() => void togglePlay()}
            type="button"
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <div className={styles.controlsEnd}>
            <button
              aria-label={muted ? 'Unmute' : 'Mute'}
              className={styles.control}
              disabled={!ready}
              onClick={() => void toggleMute()}
              type="button"
            >
              {muted ? 'Unmute' : 'Mute'}
            </button>
            <button
              aria-label={expanded ? 'Exit full screen' : 'Full screen'}
              className={styles.control}
              disabled={!ready}
              onClick={() => void toggleFullscreen()}
              type="button"
            >
              {expanded ? 'Exit' : 'Full screen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
