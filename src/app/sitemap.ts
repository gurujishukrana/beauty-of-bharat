import type { MetadataRoute } from 'next'

import { sitemapData } from '@/lib/feeds'
import { absoluteUrl, routes } from '@/lib/url'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { articles, people, categories, pages } = await sitemapData()
  const now = new Date()
  const fixed = [routes.home, routes.news, routes.people, routes.contact].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency:
      path === routes.home || path === routes.news ? ('hourly' as const) : ('weekly' as const),
    priority: path === routes.home ? 1 : 0.8,
  }))
  return [
    ...fixed,
    ...pages.map((p) => ({
      url: absoluteUrl(`/${p.slug}`),
      lastModified: new Date(p.updatedAt),
      priority: 0.5,
    })),
    ...categories.map((c) => ({
      url: absoluteUrl(routes.category(c.slug)),
      lastModified: new Date(c.updatedAt),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })),
    ...articles.map((a) => ({
      url: absoluteUrl(routes.article(a.slug)),
      lastModified: new Date(a.updatedAt),
      priority: 0.7,
    })),
    ...people.map((p) => ({
      url: absoluteUrl(routes.person(p.slug)),
      lastModified: new Date(p.updatedAt),
      priority: 0.5,
    })),
  ]
}
