import type { CollectionAfterChangeHook } from 'payload'

import { routes } from '@/lib/url'

/**
 * When a published story's slug changes, keep the old address working with a permanent redirect
 * to the article (by reference, so later renames still resolve). If the story is renamed back to
 * an address that was being redirected, that redirect is removed.
 */
export const redirectOldSlug: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const oldSlug = previousDoc?.slug as string | undefined
  const newSlug = doc.slug as string | undefined
  if (!oldSlug || !newSlug || oldSlug === newSlug) return doc
  // Only when the new slug actually goes live (not on draft autosaves).
  if (doc._status !== 'published' || previousDoc?._status !== 'published') return doc

  const from = routes.article(oldSlug)
  const newPath = routes.article(newSlug)

  try {
    await req.payload.delete({
      collection: 'redirects',
      where: { from: { equals: newPath } },
      req,
    })

    const existing = await req.payload.find({
      collection: 'redirects',
      where: { from: { equals: from } },
      limit: 1,
      depth: 0,
      req,
    })
    if (existing.totalDocs === 0) {
      await req.payload.create({
        collection: 'redirects',
        data: {
          from,
          type: '301',
          to: { type: 'reference', reference: { relationTo: 'articles', value: doc.id } },
        },
        req,
      })
    }
  } catch (error) {
    req.payload.logger.error({ err: error }, `Could not create redirect from ${from}`)
  }
  return doc
}
