import { getPayloadClient } from './queries'
import { routes } from './url'

/**
 * Looks up a stored redirect for `path` (created when a story's slug changes, or by editors
 * under Settings → Redirects) and returns where it should go, or null.
 */
export async function findRedirect(path: string): Promise<string | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'redirects',
    where: { from: { equals: path } },
    limit: 1,
    depth: 1,
  })
  const redirect = docs[0]
  if (!redirect?.to) return null
  if (redirect.to.type === 'custom') return redirect.to.url || null

  const ref = redirect.to.reference
  if (!ref || typeof ref.value !== 'object' || !ref.value) return null
  const doc = ref.value as { slug?: string; _status?: string | null }
  if (!doc.slug || doc._status !== 'published') return null
  switch (ref.relationTo) {
    case 'articles':
      return routes.article(doc.slug)
    case 'people':
      return routes.person(doc.slug)
    default:
      return `/${doc.slug}`
  }
}
