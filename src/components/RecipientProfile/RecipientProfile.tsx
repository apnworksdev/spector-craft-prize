import { CmsImage } from '@/components/CmsImage/CmsImage'
import { CmsRichText } from '@/components/CmsRichText/CmsRichText'
import { RecipientArticle } from '@/components/RecipientProfile/RecipientArticle'
import { hasLexicalText } from '@/lib/richText'
import { vimeoVideoId } from '@/lib/vimeo'
import type { PrizeRecipient } from '@/payload-types'

import styles from './RecipientProfile.module.css'

type RecipientProfileProps = {
  recipient: PrizeRecipient
}

export function RecipientProfile({ recipient }: RecipientProfileProps) {
  const secondaryImages = (recipient.secondary?.images ?? []).filter((item) => item.image)
  const article = (recipient.article ?? []).filter((block) => {
    if (block.blockType === 'text') {
      return hasLexicalText(block.content)
    }

    return Boolean(block.image) || Boolean(vimeoVideoId(block.vimeoUrl))
  })
  const hasMainCopy =
    Boolean(recipient.name) ||
    Boolean(recipient.location) ||
    hasLexicalText(recipient.main?.content)
  const hasMain = hasMainCopy || Boolean(recipient.main?.image)
  const hasSecondary = secondaryImages.length > 0 || hasLexicalText(recipient.secondary?.content)
  const hasArticle = article.length > 0

  return (
    <article className={styles.profile}>
      {hasMain ? (
        <section className={styles.main}>
          <div className={styles.copy}>
            <CmsRichText data={recipient.main?.content} className={styles.richText} />
          </div>
          {recipient.main?.image ? (
            <div className={styles.media}>
              <CmsImage
                className={styles.image}
                fallbackAlt={recipient.name}
                href={recipient.main.link}
                priority
                size="hero"
                sizes="(max-width: 800px) 100vw, 50vw"
                value={recipient.main.image}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {hasSecondary ? (
        <section className={styles.secondary} data-images={secondaryImages.length || undefined}>
          <div className={styles.copy}>
            <CmsRichText data={recipient.secondary?.content} className={styles.richText} />
          </div>
          {secondaryImages.length ? (
            <div className={styles.mediaColumns}>
              {secondaryImages.map((item) => (
                <div className={styles.media} key={item.id}>
                  <CmsImage
                    className={styles.image}
                    fallbackAlt={recipient.name}
                    href={item.link}
                    size="card"
                    sizes="(max-width: 800px) 100vw, 50vw"
                    value={item.image}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {hasArticle ? <RecipientArticle article={article} name={recipient.name} /> : null}
    </article>
  )
}
