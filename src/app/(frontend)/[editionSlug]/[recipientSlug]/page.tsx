import { notFound } from 'next/navigation'

import { CmsImage } from '@/components/CmsImage/CmsImage'
import { CmsRichText } from '@/components/CmsRichText/CmsRichText'
import { getCachedRecipient, listRecipients } from '@/lib/cms'
import { parseEditionSlug } from '@/lib/editions'

import styles from './page.module.css'

type RecipientPageProps = {
  params: Promise<{
    editionSlug: string
    recipientSlug: string
  }>
}

export async function generateStaticParams() {
  const recipients = await listRecipients()

  return recipients.docs.flatMap((recipient) => {
    const edition = recipient.edition

    if (typeof edition !== 'object' || !edition?.year) {
      return []
    }

    return [
      {
        editionSlug: `${edition.year}-prize-recipients`,
        recipientSlug: recipient.slug,
      },
    ]
  })
}

export async function generateMetadata({ params }: RecipientPageProps) {
  const { editionSlug, recipientSlug } = await params
  const recipient = await findRecipient(editionSlug, recipientSlug)

  if (!recipient) {
    return { title: 'Spector Craft Prize' }
  }

  return { title: `${recipient.name} — Spector Craft Prize` }
}

export default async function RecipientPage({ params }: RecipientPageProps) {
  const { editionSlug, recipientSlug } = await params
  const recipient = await findRecipient(editionSlug, recipientSlug)

  if (!recipient) {
    notFound()
  }

  return (
    <article className={styles.page}>
      <h1>{recipient.name}</h1>
      <CmsImage
        className={styles.image}
        fallbackAlt={recipient.name}
        size="hero"
        sizes="(max-width: 42rem) 100vw, 672px"
        value={recipient.image}
      />
      <CmsRichText data={recipient.content} />
    </article>
  )
}

async function findRecipient(editionSlug: string, recipientSlug: string) {
  const year = parseEditionSlug(editionSlug)

  if (!year) {
    return null
  }

  return getCachedRecipient(year, recipientSlug)
}
