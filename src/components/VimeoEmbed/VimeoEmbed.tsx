'use client'

import Player from '@vimeo/player'
import { useEffect, useRef, useState } from 'react'

import { vimeoVideoRef } from '@/lib/vimeo'

import styles from './VimeoEmbed.module.css'

type VimeoEmbedProps = {
  url: string
  className?: string
  title?: string
  /** Progress bar for longer horizontal films. */
  progress?: boolean
  /** Tighter controls for portrait videos. */
  compact?: boolean
}

export function VimeoEmbed({
  url,
  className,
  title = 'Vimeo video',
  progress = false,
  compact = false,
}: VimeoEmbedProps) {
  const video = vimeoVideoRef(url)
  const playerShellRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !video) {
      return
    }

    let cancelled = false
    const player = new Player(container, {
      url: video.hash ? `https://vimeo.com/${video.id}/${video.hash}` : `https://vimeo.com/${video.id}`,
      autoplay: true,
      muted: true,
      controls: false,
      title: false,
      byline: false,
      portrait: false,
      dnt: true,
      responsive: false,
    })
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

    void player
      .ready()
      .then(async () => {
        if (cancelled) {
          return
        }

        player.on('play', onPlay)
        player.on('pause', onPause)
        player.on('volumechange', onVolumeChange)
        if (progress) {
          player.on('timeupdate', onTimeUpdate)
        }

        const [isMuted, length, seconds] = await Promise.all([
          player.getMuted(),
          progress ? player.getDuration() : Promise.resolve(0),
          progress ? player.getCurrentTime() : Promise.resolve(0),
        ])
        if (cancelled) {
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
      })
      .catch(() => {
        if (!cancelled) {
          setReady(false)
        }
      })

    return () => {
      cancelled = true
      playerRef.current = null
      void player.destroy().catch(() => undefined)
    }
  }, [video?.id, video?.hash, progress])

  useEffect(() => {
    const onFullscreenChange = () => {
      const shell = playerShellRef.current
      setFullscreen(Boolean(shell && document.fullscreenElement === shell))
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

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

  const toggleFullscreen = async () => {
    const shell = playerShellRef.current
    if (!shell) {
      return
    }

    if (document.fullscreenElement === shell) {
      await document.exitFullscreen()
      return
    }

    if (shell.requestFullscreen) {
      await shell.requestFullscreen()
    }
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
      className={`${styles.player}${compact ? ` ${styles.compact}` : ''}${className ? ` ${className}` : ''}`}
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
              aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
              className={styles.control}
              disabled={!ready}
              onClick={() => void toggleFullscreen()}
              type="button"
            >
              {fullscreen ? 'Exit' : 'Full screen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
