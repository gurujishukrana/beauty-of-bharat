import type { CollectionSlug, Payload } from 'payload'

/** Collections that hold sample content, in a safe deletion order (dependents first). */
const SAMPLE_COLLECTIONS: CollectionSlug[] = [
  'articles',
  'pages',
  'people',
  'locations',
  'categories',
  'media',
]

/** Deletes every document marked `isSample: true`. Real content is never touched. */
export async function clearSampleContent(payload: Payload): Promise<number> {
  const context = { disableRevalidate: true }
  let total = 0

  // Redirects pointing at sample articles.
  const sampleArticleIds = (
    await payload.find({
      collection: 'articles',
      where: { isSample: { equals: true } },
      limit: 1000,
      depth: 0,
      pagination: false,
      draft: true,
    })
  ).docs.map((a) => a.id)
  if (sampleArticleIds.length) {
    const { docs } = await payload.delete({
      collection: 'redirects',
      where: { 'to.reference.value': { in: sampleArticleIds } },
      context,
    })
    total += docs.length
  }

  for (const collection of SAMPLE_COLLECTIONS) {
    const { docs, errors } = await payload.delete({
      collection,
      where: { isSample: { equals: true } },
      context,
    })
    total += docs.length
    if (errors.length) payload.logger.warn({ errors }, `Some ${collection} could not be deleted`)
    payload.logger.info(`Deleted ${docs.length} sample ${collection}`)
  }
  // References to deleted documents (e.g. "Most read" picks in Site settings) are cleared by the
  // database's foreign keys, so nothing else needs tidying.
  return total
}
