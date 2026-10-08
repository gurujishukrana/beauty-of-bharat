'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'

import { loadMoreArticles } from '@/app/(frontend)/actions'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { ArticleListItem } from '@/components/articles/ArticleListItem'
import type { CardData } from '@/lib/cards'
import { copy } from '@/lib/copy'
import { cn } from '@/lib/cn'

/**
 * Appends the next page of stories in place. It is a real link to `fallbackHref`
 * (e.g. /news?page=2), so it still works with JavaScript off.
 */
export function LoadMore({
  exclude,
  fallbackHref,
  limit = 6,
  authorId,
  layout = 'grid',
  label = copy.home.loadMore,
  align = 'center',
}: {
  exclude: number[]
  fallbackHref: string
  limit?: number
  authorId?: number
  layout?: 'grid' | 'list'
  label?: string
  align?: 'center' | 'start'
}) {
  const [cards, setCards] = useState<CardData[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [pending, startTransition] = useTransition()

  const load = (event: React.MouseEvent) => {
    event.preventDefault()
    startTransition(async () => {
      const result = await loadMoreArticles({ exclude, page, limit, authorId })
      setCards((current) => [...current, ...result.cards])
      setPage((p) => p + 1)
      setHasMore(result.hasMore)
    })
  }

  return (
    <>
      {cards.length > 0 &&
        (layout === 'grid' ? (
          <div className="mt-0 grid grid-cols-1 gap-x-8 sm:mt-11 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] sm:gap-y-11">
            {cards.map((card) => (
              <ArticleCard key={card.id} card={card} compactOnMobile />
            ))}
          </div>
        ) : (
          <div>
            {cards.map((card) => (
              <ArticleListItem key={card.id} card={card} showAuthor={false} thumbWidth={156} />
            ))}
          </div>
        ))}
      <p aria-live="polite" className="sr-only">
        {pending ? copy.home.loading : cards.length ? `${cards.length} more stories loaded` : ''}
      </p>
      {hasMore && (
        <div className={cn('mt-5 flex sm:mt-12', align === 'center' ? 'justify-center' : 'justify-start sm:mt-7')}>
          <Link
            href={fallbackHref}
            onClick={load}
            aria-disabled={pending}
            className="inline-flex h-12 items-center justify-center rounded-xs border-[1.5px] border-ink bg-paper px-8 text-[15px] font-semibold text-ink max-sm:w-full"
          >
            {pending ? copy.home.loading : label}
          </Link>
        </div>
      )}
    </>
  )
}
