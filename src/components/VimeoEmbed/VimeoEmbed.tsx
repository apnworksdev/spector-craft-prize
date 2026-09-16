'use client'

import Player from '@vimeo/player'
import { useEffect, useRef, useState } from 'react'

import { vimeoEmbedSrc, vimeoVideoRef } from '@/lib/vimeo'

import styles from './VimeoEmbed.module.css'

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
}

type FullscreenNode = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
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
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    const src = vimeoEmbedSrc(url)
    if (!container || !video || !src) {
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
    container.appendChild(iframe)

    const player = new Player(iframe)
    playerRef.current = player
    setReady(false)
    setDuration(0)
    setCurrentTime(0)

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onVolumeChange = (data: { muted: boolean }) => setMuted(data.muted)
    const onTimeUpdate = (data: { seconds?: number; duration?: number }) => {
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
      void player.destroy().catch(() => undefined)
      iframe.remove()
    }

    void player
      .ready()
      .then(async () => {
        if (cancelled) {
          safeDestroy()
          return
        }

        player.on('play', onPlay)
        player.on('pause', onPause)
        player.on('volumechange', onVolumeChange)
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

          try {
            await player.play()
            if (!cancelled) {
              setPlaying(true)
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
  }, [progress, title, url, video?.hash, video?.id])

  useEffect(() => {
    const onFullscreenChange = () => {
      const shell = playerShellRef.current
      const active = getFullscreenElement()
      setExpanded(Boolean(shell && active === shell))
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', onFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
    }
  }, [])

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

  useEffect(() => {
    if (!ready) {
      return
    }

    const sync = () => {
      const player = playerRef.current
      if (!player) {
        return
      }

      void player
        .getPaused()
        .then((isPaused) => {
          if (playerRef.current === player) {
            setPlaying(!isPaused)
          }
        })
        .catch(() => undefined)

      if (!progress) {
        return
      }

      void player
        .getCurrentTime()
        .then((seconds) => {
          if (playerRef.current === player) {
            setCurrentTime(seconds)
          }
        })
        .catch(() => undefined)
    }

    sync()
    const timer = window.setInterval(sync, 250)
    return () => window.clearInterval(timer)
  }, [progress, ready])

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
    const active = getFullscreenElement()
    if (active) {
      await exitNativeFullscreen()
    }
    setExpanded(false)
  }

  const toggleFullscreen = async () => {
    const shell = playerShellRef.current
    if (!shell) {
      return
    }

    if (expanded || getFullscreenElement() === shell) {
      await exitExpanded()
      return
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

    setExpanded(true)
  }

  const seek = async (clientX: number, target: HTMLElement) => {
    const player = playerRef.current
    if (!player || !duration) {
      return
    }

    const rect = target.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const seconds = ratio * duration
    setCurrentTime(seconds)
    try {
      await player.setCurrentTime(seconds)
    } catch {
      return
    }
  }

  const percent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  return (
    <div
      className={`${styles.player}${compact ? ` ${styles.compact}` : ''}${expanded ? ` ${styles.expanded}` : ''}${className ? ` ${className}` : ''}`}
      ref={playerShellRef}
      title={title}
    >
      <div className={styles.frame} ref={containerRef} />
      <div className={styles.controls}>
        {progress ? (
          <button
            aria-label="Seek"
            aria-valuemax={Math.round(duration)}
            aria-valuemin={0}
            aria-valuenow={Math.round(currentTime)}
            className={styles.progress}
            disabled={!ready || duration <= 0}
            onClick={(event) => void seek(event.clientX, event.currentTarget)}
            role="slider"
            type="button"
          >
            <span className={styles.progressFill} style={{ width: `${percent}%` }} />
          </button>
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
