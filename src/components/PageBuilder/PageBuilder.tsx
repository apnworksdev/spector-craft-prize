import { CmsMedia } from '@/components/CmsMedia/CmsMedia'
import { CmsRichText } from '@/components/CmsRichText/CmsRichText'
import { VimeoEmbed } from '@/components/VimeoEmbed/VimeoEmbed'
import { hasLexicalText } from '@/lib/richText'
import { vimeoVideoId } from '@/lib/vimeo'
import type { BannerBlock, Home, MediaColumnsBlock, QuoteBlock, RichTextBlock } from '@/payload-types'

import styles from './PageBuilder.module.css'

type PageBuilderProps = {
  layout?: Home['layout']
}

export function PageBuilder({ layout }: PageBuilderProps) {
  if (!layout?.length) {
    return null
  }

  return (
    <div className={styles.sections}>
      {layout.map((block) => {
        switch (block.blockType) {
          case 'banner':
            return <BannerSection block={block} key={block.id} />
          case 'richText':
            return <RichTextSection block={block} key={block.id} />
          case 'mediaColumns':
            return <MediaColumnsSection block={block} key={block.id} />
          case 'quote':
            return <QuoteSection block={block} key={block.id} />
          default:
            return null
        }
      })}
    </div>
  )
}

function BannerSection({ block }: { block: BannerBlock }) {
  const vimeo = vimeoVideoId(block.vimeoUrl) ? block.vimeoUrl : null

  return (
    <section className={styles.banner}>
      <div className={styles.bannerWrapper}>
        {vimeo ? (
          <VimeoEmbed className={styles.media} progress title={block.title ?? undefined} url={vimeo} />
        ) : (
          <CmsMedia
            className={styles.media}
            fallbackAlt={block.title ?? undefined}
            href={block.link}
            priority
            size="hero"
            sizes="100vw"
            value={block.media}
          />
        )}
        {block.title || block.subtitle ? (
          <div className={styles.bannerCopy}>
            {block.title ? <h1 className={styles.bannerTitle}>{block.title}</h1> : null}
            {block.subtitle ? <p className={styles.bannerSubtitle}>{block.subtitle}</p> : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function RichTextSection({ block }: { block: RichTextBlock }) {
  const width = block.width || 'narrow'

  return (
    <section className={`${styles.richText} ${styles[width]}`}>
      <CmsRichText data={block.content} />
    </section>
  )
}

function MediaColumnsSection({ block }: { block: MediaColumnsBlock }) {
  const count = block.columns.length
  const aspect = block.aspectRatio || 'horizontal'
  const hasMediaAndContent = block.columns.some(
    (column) =>
      (column.media || vimeoVideoId(column.vimeoUrl)) && hasLexicalText(column.content),
  )

  return (
    <section
      className={`${styles.columns} ${styles[aspect]}${hasMediaAndContent ? '' : ` ${styles.noMediaAndContent}`}`}
      data-cols={count}
    >
      {block.columns.map((column) => {
        const vimeo = vimeoVideoId(column.vimeoUrl) ? column.vimeoUrl : null
        const hasVisual = Boolean(vimeo || column.media)

        return (
          <div
            className={`${styles.column}${hasVisual ? '' : ` ${styles.columnNoMedia} ${styles[aspect]}`}`}
            key={column.id}
          >
            {vimeo ? (
              <div className={`${styles.columnMediaWrapper} ${styles[aspect]}`}>
                <VimeoEmbed
                  className={styles.columnMedia}
                  compact={aspect === 'vertical'}
                  progress={aspect === 'horizontal'}
                  url={vimeo}
                />
              </div>
            ) : column.media ? (
              <div className={`${styles.columnMediaWrapper} ${styles[aspect]}`}>
                <CmsMedia
                  className={styles.columnMedia}
                  href={column.link}
                  size="card"
                  sizes="(max-width: 800px) 100vw, 50vw"
                  value={column.media}
                />
              </div>
            ) : null}
            <CmsRichText data={column.content} className={styles.columnRichText} />
          </div>
        )
      })}
    </section>
  )
}

function QuoteSection({ block }: { block: QuoteBlock }) {
  return (
    <section className={styles.quote}>
      <figure>
        <blockquote className={styles.quoteText}>
          <p>&ldquo;{block.quote}&rdquo;</p>
        </blockquote>
        <figcaption className={styles.quoteWriter}>{block.writer}</figcaption>
      </figure>
    </section>
  )
}
