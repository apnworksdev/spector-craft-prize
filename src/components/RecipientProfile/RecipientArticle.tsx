'use client'

import { CmsImage } from '@/components/CmsImage/CmsImage'
import { CmsRichText } from '@/components/CmsRichText/CmsRichText'
import { VimeoEmbed } from '@/components/VimeoEmbed/VimeoEmbed'
import { hasLexicalText } from '@/lib/richText'
import { useIsMobile } from '@/lib/useIsMobile'
import { vimeoVideoId } from '@/lib/vimeo'
import type { PrizeRecipient, RecipientMediaBlock, RecipientTextBlock } from '@/payload-types'

import styles from './RecipientProfile.module.css'

type ArticleBlock = NonNullable<PrizeRecipient['article']>[number]

type RecipientArticleProps = {
  article: NonNullable<PrizeRecipient['article']>
  name: string
}

function isTextBlock(block: ArticleBlock): block is RecipientTextBlock {
  return block.blockType === 'text'
}

function isMediaBlock(block: ArticleBlock): block is RecipientMediaBlock {
  return block.blockType === 'media'
}

function mediaBlockHasContent(block: RecipientMediaBlock) {
  return Boolean(block.image) || Boolean(vimeoVideoId(block.vimeoUrl))
}

function ArticleMedia({ block, name }: { block: RecipientMediaBlock; name: string }) {
  const vimeo = vimeoVideoId(block.vimeoUrl) ? block.vimeoUrl : null

  const media = (
    <div className={`${styles.media}${vimeo ? ` ${styles.mediaVimeo}` : ''}`}>
      {vimeo ? (
        <VimeoEmbed className={styles.image} compact title={`${name} gallery video`} url={vimeo} />
      ) : (
        <CmsImage
          className={styles.image}
          fallbackAlt={name}
          href={block.link}
          size="card"
          sizes="(max-width: 800px) 100vw, 50vw"
          value={block.image}
        />
      )}
    </div>
  )

  if (!vimeo) {
    return media
  }

  return <div className={styles.mediaFrame}>{media}</div>
}

function ArticleText({ block }: { block: RecipientTextBlock }) {
  if (!hasLexicalText(block.content)) {
    return null
  }

  return (
    <div className={styles.copy}>
      <CmsRichText data={block.content} className={styles.richText} />
    </div>
  )
}

export function RecipientArticle({ article, name }: RecipientArticleProps) {
  const isMobile = useIsMobile()
  const textBlocks = article.filter(isTextBlock).filter((block) => hasLexicalText(block.content))
  const mediaBlocks = article.filter(isMediaBlock).filter(mediaBlockHasContent)
  const hasText = textBlocks.length > 0
  const hasMedia = mediaBlocks.length > 0

  if (!hasText && !hasMedia) {
    return null
  }

  if (isMobile) {
    return (
      <section className={styles.article} data-layout="mobile-flow" aria-label="Article">
        {article.map((block) => {
          if (isTextBlock(block)) {
            return <ArticleText block={block} key={block.id} />
          }

          if (isMediaBlock(block) && mediaBlockHasContent(block)) {
            return <ArticleMedia block={block} key={block.id} name={name} />
          }

          return null
        })}
      </section>
    )
  }

  const layout = hasText && hasMedia ? 'split' : hasText ? 'copy' : 'media'

  return (
    <section className={styles.article} data-layout={layout}>
      {hasText ? (
        <div className={styles.copyColumn}>
          {textBlocks.map((block) => (
            <ArticleText block={block} key={block.id} />
          ))}
        </div>
      ) : null}
      {hasMedia ? (
        <div className={styles.mediaStack} aria-label="Gallery">
          {mediaBlocks.map((block) => (
            <ArticleMedia block={block} key={block.id} name={name} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
