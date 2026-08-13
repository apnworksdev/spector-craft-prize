import { notFound } from 'next/navigation'

import { CmsRichText } from '@/components/CmsRichText/CmsRichText'
import { parseEditionSlug } from '@/lib/editions'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'

import styles from './page.module.css'

export const dynamic = 'force-dynamic'

type RecipientPageProps = {
  params: Promise<{
    editionSlug: string
    recipientSlug: string
  }>
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

  const src = mediaUrl(recipient.image)

  return (
    <article className={styles.page}>
      <h1>{recipient.name}</h1>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={mediaAlt(recipient.image, recipient.name)} className={styles.image} src={src} />
      ) : null}
      <CmsRichText data={recipient.content} />
    </article>
  )
}

async function findRecipient(editionSlug: string, recipientSlug: string) {
  const year = parseEditionSlug(editionSlug)

  if (!year) {
    return null
  }

  const payload = await getPayloadClient()
  const editions = await payload.find({
    collection: 'editions',
    where: {
      year: {
        equals: year,
      },
    },
    limit: 1,
  })
  const edition = editions.docs[0]

  if (!edition) {
    return null
  }

  const recipients = await payload.find({
    collection: 'prize-recipients',
    depth: 1,
    where: {
      and: [
        {
          edition: {
            equals: edition.id,
          },
        },
        {
          slug: {
            equals: recipientSlug,
          },
        },
      ],
    },
    limit: 1,
  })

  return recipients.docs[0] ?? null
}
