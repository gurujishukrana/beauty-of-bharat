import Link from 'next/link'

import { ArticleCard } from '@/components/articles/ArticleCard'
import { Pagination } from '@/components/Pagination'
import { toCard } from '@/lib/cards'
import { copy } from '@/lib/copy'
import { cn } from '@/lib/cn'
import type { ArticleSummary } from '@/lib/queries'
import { routes } from '@/lib/url'
import type { Category } from '@/payload-types'

/** Shared layout for /news and /category/[slug]: title, chips, card grid, pagination. */
export function ArticleArchive({
  title,
  kicker,
  description,
  categories,
  activeSlug,
  articles,
  page,
  totalPages,
  basePath,
}: {
  title: string
  kicker?: string
  description?: string | null
  categories: Category[]
  activeSlug: string | null
  articles: ArticleSummary[]
  page: number
  totalPages: number
  basePath: string
}) {
  const chips: { name: string; href: string; slug: string | null }[] = [
    { name: copy.news.allTopics, href: routes.news, slug: null },
    ...categories.map((c) => ({ name: c.name, href: routes.category(c.slug), slug: c.slug })),
  ]
  return (
    <>
      <section className="container-site flex flex-col gap-4 pt-10 pb-6 sm:gap-[18px] sm:pt-16 sm:pb-8">
        {kicker ? <p className="kicker sm:text-xs">{kicker}</p> : null}
        <h1 className="font-serif text-[36px] leading-[1.04] font-medium tracking-[-0.015em] sm:text-[52px]">
          {title}
          {page > 1 ? <span className="sr-only">, {copy.pagination.page(page)}</span> : null}
        </h1>
        {description ? (
          <p className="max-w-[640px] text-[17px] leading-[1.6] text-body sm:text-lg">
            {description}
          </p>
        ) : null}
        <nav aria-label={copy.nav.categoriesLabel} className="mt-2">
          <ul className="flex flex-wrap gap-2">
            {chips.map((chip) => {
              const active = chip.slug === activeSlug
              return (
                <li key={chip.href}>
                  <Link
                    href={chip.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center rounded-full border px-4 text-sm font-medium',
                      active
                        ? 'border-ink bg-ink text-white hover:text-white'
                        : 'border-chip bg-paper text-ink',
                    )}
                  >
                    {chip.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </section>

      <section className="container-site pb-14 sm:pb-20">
        <div className="border-t-2 border-ink pt-2 sm:pt-8">
          {articles.length ? (
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] sm:gap-y-11">
              {articles.map((article, i) => (
                <ArticleCard
                  key={article.id}
                  card={toCard(article)}
                  compactOnMobile={i > 0}
                  headingLevel="h2"
                />
              ))}
            </div>
          ) : (
            <p className="py-10 text-body">{copy.news.empty}</p>
          )}
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          href={(p) =>
            p === 1 ? basePath : `${basePath}${basePath.includes('?') ? '&' : '?'}page=${p}`
          }
        />
      </section>
    </>
  )
}

/** Reads ?page=N; anything invalid means page 1. */
export function pageParam(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(n) && n > 1 && n < 10_000 ? n : 1
}

/** Canonical + prev/next links for paginated lists. */
export function paginationMetadata(basePath: string, page: number, totalPages: number) {
  const at = (p: number) => (p === 1 ? basePath : `${basePath}?page=${p}`)
  return {
    canonical: at(page),
    prev: page > 1 ? at(page - 1) : null,
    next: page < totalPages ? at(page + 1) : null,
  }
}

export function PaginationLinks({ prev, next }: { prev: string | null; next: string | null }) {
  return (
    <>
      {prev ? <link rel="prev" href={prev} /> : null}
      {next ? <link rel="next" href={next} /> : null}
    </>
  )
}
