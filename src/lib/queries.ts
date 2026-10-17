import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import { publicPeopleWhere, publishedWhere } from '@/access'
import type { Article, Category, Navigation, Person, SiteSetting } from '@/payload-types'

/** A story without its body text (what list queries return). */
export type ArticleSummary = Omit<Article, 'body' | 'plainText'>

import { SITE_TIME_ZONE } from './dates'
import { searchTerms } from './text'

export const getPayloadClient = () => getPayload({ config })

/* ----------------------------------------------------------------------------- Settings */

export const getSiteSettings = cache(async (): Promise<SiteSetting> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'siteSettings', depth: 1 })
})

export const getNavigation = cache(async (): Promise<Navigation> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'navigation', depth: 0 })
})

export const getCategories = cache(async (): Promise<Category[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'categories',
    sort: 'order',
    limit: 100,
    depth: 0,
    pagination: false,
  })
  return docs
})

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
})

/* ----------------------------------------------------------------------------- Articles */

export const PAGE_SIZE = 12

type ListArgs = {
  page?: number
  limit?: number
  categoryId?: number
  authorId?: number
  excludeIds?: number[]
  featured?: boolean
}

function articleWhere({ categoryId, authorId, excludeIds, featured }: ListArgs): Where {
  const and: Where[] = [publishedWhere]
  if (categoryId) {
    and.push({
      or: [{ primaryCategory: { equals: categoryId } }, { categories: { in: [categoryId] } }],
    })
  }
  if (authorId) and.push({ authors: { in: [authorId] } })
  if (excludeIds?.length) and.push({ id: { not_in: excludeIds } })
  if (featured) and.push({ featured: { equals: true } })
  return { and }
}

/** Published stories, newest first. Depth 1 populates category, location, authors and hero. */
export async function listArticles(args: ListArgs = {}) {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'articles',
    where: articleWhere(args),
    sort: '-publishedAt',
    page: Math.max(1, args.page ?? 1),
    limit: args.limit ?? PAGE_SIZE,
    depth: 1,
    select: { body: false, plainText: false },
  })
}

export const getArticleBySlug = cache(
  async (slug: string, draft = false): Promise<Article | null> => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'articles',
      where: draft
        ? { slug: { equals: slug } }
        : { and: [{ slug: { equals: slug } }, publishedWhere] },
      draft,
      limit: 1,
      depth: 2,
      select: { plainText: false },
    })
    return docs[0] ?? null
  },
)

/** Editor-picked related stories, topped up with the newest from the same category, then anything. */
export async function getRelatedArticles(article: Article, count = 3): Promise<ArticleSummary[]> {
  const picked: ArticleSummary[] = (article.relatedArticles ?? []).filter(
    (a): a is Article => typeof a === 'object' && a !== null && a._status === 'published',
  )
  if (picked.length >= count) return picked.slice(0, count)

  const exclude = [article.id, ...picked.map((a) => a.id)]
  const categoryId =
    typeof article.primaryCategory === 'object'
      ? article.primaryCategory.id
      : article.primaryCategory
  const sameCategory = await listArticles({
    categoryId,
    excludeIds: exclude,
    limit: count - picked.length,
  })
  const result = [...picked, ...sameCategory.docs]
  if (result.length >= count) return result

  const rest = await listArticles({
    excludeIds: [...exclude, ...sameCategory.docs.map((a) => a.id)],
    limit: count - result.length,
  })
  return [...result, ...rest.docs]
}

/* ----------------------------------------------------------------------------- Home */

export async function getHomeData() {
  const settings = await getSiteSettings()
  const home = settings.homepage ?? {}
  const latestCount = home.latestCount ?? 6

  // The newest featured story leads; the next two featured stories sit beside it.
  // Without enough featured stories, the newest ones fill in.
  const [featuredResult, newest] = await Promise.all([
    listArticles({ featured: true, limit: 3 }),
    listArticles({ limit: latestCount + 3 }),
  ])
  const featured = featuredResult.docs[0] ?? newest.docs[0] ?? null

  const shown = new Set<number>(featured ? [featured.id] : [])
  const secondary = [...featuredResult.docs, ...newest.docs]
    .filter((a, i, all) => !shown.has(a.id) && all.findIndex((b) => b.id === a.id) === i)
    .slice(0, 2)
  secondary.forEach((a) => shown.add(a.id))
  const latest = newest.docs.filter((a) => !shown.has(a.id)).slice(0, latestCount)

  const groundCategory =
    (typeof home.groundReportsCategory === 'object' && home.groundReportsCategory) ||
    (await getCategoryBySlug('ground-reports'))
  const ground = groundCategory
    ? (await listArticles({ categoryId: groundCategory.id, limit: 3 })).docs
    : []

  const mostRead = await getMostRead(settings)
  const people = home.showPeopleBand === false ? [] : await getPeopleBand(settings)

  return {
    settings,
    featured,
    secondary,
    latest,
    // Offset for "Load more": everything shown above the latest grid plus the grid itself.
    excludeIds: [...shown, ...latest.map((a) => a.id)],
    hasMore: newest.totalDocs > shown.size + latest.length,
    groundCategory,
    ground,
    mostRead,
    people,
  }
}

async function getMostRead(settings: SiteSetting): Promise<ArticleSummary[]> {
  const home = settings.homepage ?? {}
  let picked: ArticleSummary[] = []

  if (home.mostReadMode === 'views') {
    picked = await getMostViewed(5)
  } else {
    picked = (home.mostReadPinned ?? []).filter(
      (a): a is Article => typeof a === 'object' && a !== null && a._status === 'published',
    )
  }
  if (picked.length >= 5) return picked.slice(0, 5)
  const fill = await listArticles({ excludeIds: picked.map((a) => a.id), limit: 5 - picked.length })
  return [...picked, ...fill.docs]
}

/** Totals from the last 7 days of daily counters. */
async function getMostViewed(limit: number): Promise<ArticleSummary[]> {
  const payload = await getPayloadClient()
  const since = new Date(Date.now() - 7 * 864e5)
  const { docs } = await payload.find({
    collection: 'articleViews',
    where: { day: { greater_than_equal: istDay(since) } },
    limit: 2000,
    depth: 0,
    pagination: false,
  })
  const totals = new Map<number, number>()
  for (const row of docs) {
    const id = typeof row.article === 'object' ? row.article.id : row.article
    totals.set(id, (totals.get(id) ?? 0) + (row.count ?? 0))
  }
  const ids = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit * 2)
    .map(([id]) => id)
  if (!ids.length) return []
  const { docs: articles } = await payload.find({
    collection: 'articles',
    where: { and: [publishedWhere, { id: { in: ids } }] },
    limit: ids.length,
    depth: 1,
    select: { body: false, plainText: false },
  })
  return articles.sort((a, b) => (totals.get(b.id) ?? 0) - (totals.get(a.id) ?? 0)).slice(0, limit)
}

/** "YYYY-MM-DD" in India Standard Time. */
export function istDay(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: SITE_TIME_ZONE }).format(date)
}

/* ----------------------------------------------------------------------------- People */

export const getPublicPeople = cache(async (): Promise<Person[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'people',
    where: publicPeopleWhere,
    sort: '_order',
    limit: 500,
    depth: 1,
    pagination: false,
    select: { bio: false, articles: false },
  })
  return docs
})

async function getPeopleBand(settings: SiteSetting): Promise<Person[]> {
  const chosen = (settings.homepage?.peopleBandPeople ?? []).filter(
    (p): p is Person => typeof p === 'object' && p !== null,
  )
  const all = await getPublicPeople()
  if (chosen.length) {
    const visible = new Set(all.map((p) => p.id))
    return all.filter((p) => visible.has(p.id) && chosen.some((c) => c.id === p.id)).slice(0, 5)
  }
  return all.slice(0, 5)
}

export const getPersonBySlug = cache(
  async (slug: string, draft = false): Promise<Person | null> => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'people',
      where: draft
        ? { slug: { equals: slug } }
        : { and: [{ slug: { equals: slug } }, publicPeopleWhere] },
      draft,
      limit: 1,
      depth: 1,
      select: { articles: false },
    })
    return docs[0] ?? null
  },
)

/* ----------------------------------------------------------------------------- Search */

export async function searchSite(query: string) {
  const terms = searchTerms(query)
  if (!terms.length) return { terms, articles: [], people: [] }
  const payload = await getPayloadClient()

  // Every term must appear in the headline, standfirst, story text or place name.
  const articleWhere: Where = {
    and: [
      publishedWhere,
      ...terms.map((term): Where => ({
        or: [
          { title: { like: term } },
          { deck: { like: term } },
          { plainText: { like: term } },
          { 'location.name': { like: term } },
        ],
      })),
    ],
  }
  const peopleWhere: Where = {
    and: [
      publicPeopleWhere,
      ...terms.map((term): Where => ({
        or: [
          { fullName: { like: term } },
          { designation: { like: term } },
          { 'location.name': { like: term } },
          { 'location.state': { like: term } },
        ],
      })),
    ],
  }

  const [articles, people] = await Promise.all([
    payload.find({
      collection: 'articles',
      where: articleWhere,
      sort: '-publishedAt',
      limit: 30,
      depth: 1,
      select: { body: false },
    }),
    payload.find({
      collection: 'people',
      where: peopleWhere,
      sort: '_order',
      limit: 12,
      depth: 1,
      select: { bio: false, articles: false },
    }),
  ])
  return { terms, articles: articles.docs, people: people.docs }
}
