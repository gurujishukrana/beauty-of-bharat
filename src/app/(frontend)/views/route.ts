import { getPayloadClient, getSiteSettings, istDay } from '@/lib/queries'

/** Increments today's view counter for a published story. Stores nothing about the reader. */
export async function POST(req: Request): Promise<Response> {
  let slug: unknown
  try {
    slug = ((await req.json()) as { slug?: unknown }).slug
  } catch {
    return new Response(null, { status: 400 })
  }
  if (typeof slug !== 'string' || !/^[a-z0-9-]{1,120}$/.test(slug)) return new Response(null, { status: 400 })

  const settings = await getSiteSettings()
  if (settings.homepage?.mostReadMode !== 'views') return new Response(null, { status: 204 })

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    limit: 1,
    depth: 0,
    select: { slug: true },
  })
  const article = docs[0]
  if (!article) return new Response(null, { status: 404 })

  const day = istDay()
  const context = { disableRevalidate: true }
  const existing = await payload.find({
    collection: 'articleViews',
    where: { and: [{ article: { equals: article.id } }, { day: { equals: day } }] },
    limit: 1,
    depth: 0,
  })
  if (existing.docs[0]) {
    await payload.update({
      collection: 'articleViews',
      id: existing.docs[0].id,
      data: { count: (existing.docs[0].count ?? 0) + 1 },
      context,
    })
  } else {
    try {
      await payload.create({ collection: 'articleViews', data: { article: article.id, day, count: 1 }, context })
    } catch {
      // Another request created today's row first; the unique index keeps one row per day.
    }
  }
  return new Response(null, { status: 204 })
}
