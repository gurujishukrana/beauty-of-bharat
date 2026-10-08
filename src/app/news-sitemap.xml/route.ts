import { escapeXml, feedArticles } from '@/lib/feeds'
import { absoluteUrl, routes } from '@/lib/url'

export const revalidate = 900

/** Google News sitemap: stories published in the last 48 hours. */
export async function GET() {
  const since = new Date(Date.now() - 48 * 3600_000)
  const articles = await feedArticles({ limit: 1000, since })
  const urls = articles
    .map(
      (a) => `  <url>
    <loc>${absoluteUrl(routes.article(a.slug))}</loc>
    <news:news>
      <news:publication>
        <news:name>Beauty of Bharat</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(a.publishedAt || a.createdAt).toISOString()}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
    </news:news>
  </url>`,
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>
`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=900' },
  })
}
