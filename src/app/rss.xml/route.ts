import { authorsOf, categoryOf } from '@/lib/cards'
import { copy } from '@/lib/copy'
import { escapeXml, feedArticles } from '@/lib/feeds'
import { toImage } from '@/lib/media'
import { getSiteSettings } from '@/lib/queries'
import { absoluteUrl, getSiteUrl, routes } from '@/lib/url'

export const revalidate = 900

/** RSS 2.0 feed of the latest 30 stories, with summary and lead image. */
export async function GET() {
  const [articles, settings] = await Promise.all([feedArticles({ limit: 30 }), getSiteSettings()])
  const items = articles
    .map((a) => {
      const url = absoluteUrl(routes.article(a.slug))
      const image = toImage(a.heroImage, 'feature')
      const category = categoryOf(a)
      const authors = authorsOf(a).map((p) => p.fullName).join(', ')
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(a.publishedAt || a.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(a.deck)}</description>${authors ? `\n      <dc:creator>${escapeXml(authors)}</dc:creator>` : ''}${category ? `\n      <category>${escapeXml(category.name)}</category>` : ''}${image ? `\n      <media:content url="${escapeXml(absoluteUrl(image.url))}" medium="image" width="${image.width}" height="${image.height}" />` : ''}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${copy.siteName}</title>
    <link>${getSiteUrl()}</link>
    <description>${escapeXml(settings.tagline)}</description>
    <language>en-in</language>
    <atom:link href="${absoluteUrl('/rss.xml')}" rel="self" type="application/rss+xml" />
    <image>
      <url>${absoluteUrl('/icons/icon-192.png')}</url>
      <title>${copy.siteName}</title>
      <link>${getSiteUrl()}</link>
    </image>
${items}
  </channel>
</rss>
`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=900' },
  })
}
