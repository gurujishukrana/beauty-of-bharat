'use server'

import { toCard, type CardData } from '@/lib/cards'
import { listArticles } from '@/lib/queries'

const MAX_EXCLUDE = 60

/**
 * "Load more stories": the next `limit` published stories after the ones already on screen.
 * Returns plain card data, rendered by the same ArticleCard component on the client.
 */
export async function loadMoreArticles(input: {
  exclude: number[]
  page: number
  limit?: number
  authorId?: number
}): Promise<{ cards: CardData[]; hasMore: boolean }> {
  const exclude = (Array.isArray(input.exclude) ? input.exclude : [])
    .filter((n) => Number.isInteger(n))
    .slice(0, MAX_EXCLUDE)
  const limit = Math.min(Math.max(Number(input.limit) || 6, 1), 24)
  const page = Math.min(Math.max(Number(input.page) || 1, 1), 500)
  const authorId = Number.isInteger(input.authorId) ? input.authorId : undefined

  const result = await listArticles({ excludeIds: exclude, page, limit, authorId })
  return { cards: result.docs.map(toCard), hasMore: result.hasNextPage }
}
