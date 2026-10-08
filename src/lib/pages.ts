import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { cache } from 'react'

import type { Page } from '@/payload-types'

import { toImage } from './media'
import { getPayloadClient } from './queries'
import { absoluteUrl } from './url'

export const getPageBySlug = cache(async (slug: string): Promise<{ page: Page | null; draft: boolean }> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: draft ? { slug: { equals: slug } } : { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    draft,
    limit: 1,
    depth: 1,
  })
  return { page: docs[0] ?? null, draft }
})

export function pageMetadata(page: Page | null, path: string, fallbackTitle: string): Metadata {
  const og = toImage(page?.seo?.ogImage, 'og')
  return {
    title: page?.seo?.metaTitle || page?.title || fallbackTitle,
    description: page?.seo?.metaDescription || undefined,
    alternates: { canonical: path },
    robots: page?.seo?.noIndex ? { index: false } : undefined,
    openGraph: og ? { images: [{ url: absoluteUrl(og.url), width: og.width, height: og.height }] } : undefined,
  }
}
