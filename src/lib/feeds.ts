import type { Where } from 'payload'

import { publicPeopleWhere, publishedWhere } from '@/access'

import { getPayloadClient } from './queries'

/** Published stories that search engines and feeds may list (not marked "hide from search"). */
export const indexableArticles: Where = {
  and: [publishedWhere, { 'seo.noIndex': { not_equals: true } }],
}

export async function feedArticles({ limit, since }: { limit: number; since?: Date }) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    where: since ? { and: [indexableArticles, { publishedAt: { greater_than_equal: since.toISOString() } }] } : indexableArticles,
    sort: '-publishedAt',
    limit,
    depth: 1,
    select: { body: false, plainText: false },
  })
  return docs
}

export async function sitemapData() {
  const payload = await getPayloadClient()
  const [articles, people, categories, pages] = await Promise.all([
    payload.find({
      collection: 'articles',
      where: indexableArticles,
      sort: '-publishedAt',
      limit: 5000,
      depth: 0,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'people',
      where: publicPeopleWhere,
      limit: 1000,
      depth: 0,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({ collection: 'categories', limit: 200, depth: 0, pagination: false, select: { slug: true, updatedAt: true } }),
    payload.find({
      collection: 'pages',
      where: { and: [publishedWhere, { 'seo.noIndex': { not_equals: true } }] },
      limit: 100,
      depth: 0,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
  ])
  return { articles: articles.docs, people: people.docs, categories: categories.docs, pages: pages.docs }
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
