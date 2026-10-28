/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'

import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'

import { resolveAdminSegments } from '@/lib/admin-document-path'

import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

function adminParams(segments: string[] | undefined) {
  // Payload only treats the dashboard as home when `segments` is undefined.
  // An empty array becomes `/admin/` and renders "Nothing found".
  if (!segments?.length) {
    return Promise.resolve({})
  }

  return Promise.resolve({ segments })
}

export const generateMetadata = async ({ params, searchParams }: Args): Promise<Metadata> => {
  const resolved = await params
  const segments = resolved.segments?.filter(Boolean)
  if (!segments?.length) {
    return generatePageMetadata({ config, params: adminParams(undefined), searchParams })
  }

  const next = await resolveAdminSegments(segments)
  return generatePageMetadata({
    config,
    params: adminParams(next.segments),
    searchParams,
  })
}

const Page = async ({ params, searchParams }: Args) => {
  const resolved = await params
  const segments = resolved.segments?.filter(Boolean)
  if (!segments?.length) {
    return RootPage({
      config,
      params: adminParams(undefined),
      searchParams,
      importMap,
    })
  }

  const next = await resolveAdminSegments(segments)

  return RootPage({
    config,
    params: adminParams(next.segments),
    searchParams,
    importMap,
  })
}

export default Page
