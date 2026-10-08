import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/url'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/search', '/next/', '/views'] }],
    sitemap: [absoluteUrl('/sitemap.xml'), absoluteUrl('/news-sitemap.xml')],
  }
}
