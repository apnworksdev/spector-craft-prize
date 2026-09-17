'use client'

import { useEffect, useState } from 'react'

import { CmsMedia } from '@/components/CmsMedia/CmsMedia'
import { VimeoEmbed } from '@/components/VimeoEmbed/VimeoEmbed'
import { useIsMobile } from '@/lib/useIsMobile'
import { vimeoVideoId } from '@/lib/vimeo'
import type { BannerBlock } from '@/payload-types'

import styles from './PageBuilder.module.css'

export function BannerVisual({ block }: { block: BannerBlock }) {
  const isMobile = useIsMobile()
  const mobileUrl = vimeoVideoId(block.vimeoUrlMobile) ? block.vimeoUrlMobile : null
  const desktopUrl = vimeoVideoId(block.vimeoUrl) ? block.vimeoUrl : null
  const hasMobileVideo = Boolean(mobileUrl)
  const hasBothVideos = Boolean(mobileUrl && desktopUrl)
  const [canSelectVideo, setCanSelectVideo] = useState(!hasBothVideos)

  useEffect(() => {
    setCanSelectVideo(true)
  }, [])

  const useMobileVideo = Boolean(canSelectVideo && isMobile && mobileUrl)
  const vimeo = canSelectVideo ? (useMobileVideo ? mobileUrl : desktopUrl) : null

  return (
    <div className={`${styles.bannerWrapper}${hasMobileVideo ? ` ${styles.bannerHasMobile}` : ''}`}>
      {vimeo ? (
        <VimeoEmbed
          className={styles.media}
          compact={useMobileVideo}
          title={block.title ?? undefined}
          url={vimeo}
        />
      ) : canSelectVideo ? (
        <CmsMedia
          className={styles.media}
          fallbackAlt={block.title ?? undefined}
          href={block.link}
          priority
          size="hero"
          sizes="100vw"
          value={block.media}
        />
      ) : null}
      {block.title || block.subtitle ? (
        <div className={styles.bannerCopy}>
          {block.title ? <h1 className={styles.bannerTitle}>{block.title}</h1> : null}
          {block.subtitle ? <p className={styles.bannerSubtitle}>{block.subtitle}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
