import { notFound } from 'next/navigation'

import { PageBuilder } from '@/components/PageBuilder/PageBuilder'
import { getCachedEdition, listEditions } from '@/lib/cms'
import { editionPath, parseEditionSlug } from '@/lib/editions'

import styles from './page.module.css'

type EditionPageProps = {
  params: Promise<{
    editionSlug: string
  }>
}

export async function generateStaticParams() {
  const editions = await listEditions()

  return editions.docs.map((edition) => ({
    editionSlug: editionPath(edition.year).slice(1),
  }))
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

  return getCachedEdition(year)
}
