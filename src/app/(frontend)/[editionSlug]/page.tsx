import { notFound } from 'next/navigation'

import { PageBuilder } from '@/components/PageBuilder/PageBuilder'
import { parseEditionSlug } from '@/lib/editions'
import { getPayloadClient } from '@/lib/payload'

import styles from './page.module.css'

export const dynamic = 'force-dynamic'

type EditionPageProps = {
  params: Promise<{
    editionSlug: string
  }>
}

export async function generateMetadata({ params }: EditionPageProps) {
  const { editionSlug } = await params
  const edition = await findEdition(editionSlug)

  if (!edition) {
    return { title: 'Spector Craft Prize' }
  }

  return { title: `${edition.title} — Spector Craft Prize` }
}

export default async function EditionPage({ params }: EditionPageProps) {
  const { editionSlug } = await params
  const edition = await findEdition(editionSlug)

  if (!edition) {
    notFound()
  }

  return (
    <article className={styles.page}>
      <h1>{edition.title}</h1>
      <PageBuilder layout={edition.layout} />
    </article>
  )
}

async function findEdition(editionSlug: string) {
  const year = parseEditionSlug(editionSlug)

  if (!year) {
    return null
  }

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'editions',
    where: {
      year: {
        equals: year,
      },
    },
    limit: 1,
  })

  return result.docs[0] ?? null
}
