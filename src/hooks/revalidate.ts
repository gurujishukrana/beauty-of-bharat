import { revalidatePath } from 'next/cache'
import type { PayloadRequest } from 'payload'

type Target = string | [path: string, type: 'page' | 'layout']

/**
 * Revalidate cached pages after a CMS change. Silently skipped when there is no Next request
 * context (seed scripts, migrations) or when the caller sets `context.disableRevalidate`.
 */
export function revalidate(req: PayloadRequest, targets: Target[]): void {
  if (req.context?.disableRevalidate) return
  for (const target of targets) {
    try {
      if (Array.isArray(target)) revalidatePath(target[0], target[1])
      else revalidatePath(target)
    } catch (error) {
      req.payload.logger.debug({ err: error, target }, 'Skipped revalidation outside Next.js')
    }
  }
}

/** Every page an article can appear on. */
export const ARTICLE_TARGETS: Target[] = [
  '/',
  '/news',
  ['/news/[slug]', 'page'],
  ['/category/[slug]', 'page'],
  ['/people/[slug]', 'page'],
  '/rss.xml',
  '/sitemap.xml',
  '/news-sitemap.xml',
]

export const PEOPLE_TARGETS: Target[] = [
  '/',
  '/people',
  ['/people/[slug]', 'page'],
  ['/news/[slug]', 'page'],
  '/sitemap.xml',
]

/** Header, footer and category bar appear on every page. */
export const EVERYTHING: Target[] = [['/', 'layout']]
