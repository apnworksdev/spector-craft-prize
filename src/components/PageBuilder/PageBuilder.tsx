import { CmsMedia } from '@/components/CmsMedia/CmsMedia'
import { CmsRichText } from '@/components/CmsRichText/CmsRichText'
import { hasLexicalText } from '@/lib/richText'
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
  return (
    <section className={styles.banner}>
      <div className={styles.bannerWrapper}>
        <CmsMedia
          className={styles.media}
          fallbackAlt={block.title ?? undefined}
          priority
          size="hero"
          sizes="100vw"
          value={block.media}
        />
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
    (column) => column.media && hasLexicalText(column.content),
  )

  return (
    <section
      className={`${styles.columns} ${styles[aspect]}${hasMediaAndContent ? '' : ` ${styles.noMediaAndContent}`}`}
      data-cols={count}
    >
      {block.columns.map((column) => (
        <div
          className={`${styles.column}${column.media ? '' : ` ${styles.columnNoMedia}`}`}
          key={column.id}
        >
          {column.media ? (
            <div className={styles.columnMediaWrapper}>
              <CmsMedia
                size="card"
                sizes="(max-width: 800px) 100vw, 50vw"
                value={column.media}
                className={styles.columnMedia}
              />
            </div>
          ) : null}
          <CmsRichText data={column.content} className={styles.columnRichText} />
        </div>
      ))}
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
