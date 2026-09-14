'use client'

import Player from '@vimeo/player'
import { useEffect, useRef, useState } from 'react'

import { vimeoVideoRef } from '@/lib/vimeo'

import styles from './VimeoEmbed.module.css'

type VimeoEmbedProps = {
  url: string
  className?: string
  title?: string
}

export function VimeoEmbed({ url, className, title = 'Vimeo video' }: VimeoEmbedProps) {
  const video = vimeoVideoRef(url)
  const playerShellRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)

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

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onVolumeChange = (data: { muted: boolean }) => setMuted(data.muted)

    player.on('play', onPlay)
    player.on('pause', onPause)
    player.on('volumechange', onVolumeChange)

    void player
      .ready()
      .then(async () => {
        if (cancelled) {
          return
        }
        const [isPaused, isMuted] = await Promise.all([player.getPaused(), player.getMuted()])
        setPlaying(!isPaused)
        setMuted(isMuted)
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) {
          setReady(false)
        }
      })

    return () => {
      cancelled = true
      player.off('play', onPlay)
      player.off('pause', onPause)
      player.off('volumechange', onVolumeChange)
      playerRef.current = null
      void player.destroy()
    }
  }, [video?.id, video?.hash])

  useEffect(() => {
    const onFullscreenChange = () => {
      const shell = playerShellRef.current
      setFullscreen(Boolean(shell && document.fullscreenElement === shell))
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  if (!video) {
    return null
  }

  const togglePlay = async () => {
    const player = playerRef.current
    if (!player) {
      return
    }

    const isPaused = await player.getPaused()
    if (isPaused) {
      await player.play()
      setPlaying(true)
    } else {
      await player.pause()
      setPlaying(false)
    }
  }

  const toggleMute = async () => {
    const player = playerRef.current
    if (!player) {
      return
    }

    const nextMuted = !(await player.getMuted())
    await player.setMuted(nextMuted)
    if (!nextMuted) {
      await player.setVolume(1)
    }
    setMuted(nextMuted)
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

  return (
    <div
      className={`${styles.player}${className ? ` ${className}` : ''}`}
      ref={playerShellRef}
      title={title}
    >
      <div className={styles.frame} ref={containerRef} />
      <div className={styles.controls}>
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
  )
}
