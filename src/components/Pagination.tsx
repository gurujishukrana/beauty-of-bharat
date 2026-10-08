import Link from 'next/link'

import { copy } from '@/lib/copy'
import { cn } from '@/lib/cn'
import { pageWindow } from '@/lib/pagination'

/** Previous / 1 2 3 … / Next. `href(n)` builds each page's URL. */
export function Pagination({
  page,
  totalPages,
  href,
}: {
  page: number
  totalPages: number
  href: (page: number) => string
}) {
  if (totalPages <= 1) return null
  const linkBase =
    'inline-flex h-11 min-w-11 items-center justify-center rounded-xs border px-3 text-[15px] font-semibold'
  return (
    <nav aria-label={copy.pagination.label} className="mt-12 flex justify-center">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {page > 1 ? (
            <Link href={href(page - 1)} rel="prev" className={cn(linkBase, 'border-ink px-4')}>
              {copy.pagination.previous}
            </Link>
          ) : (
            <span aria-disabled="true" className={cn(linkBase, 'border-rule px-4 text-faint')}>
              {copy.pagination.previous}
            </span>
          )}
        </li>
        {pageWindow(page, totalPages).map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-subtle">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={href(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={copy.pagination.page(p)}
                className={cn(linkBase, p === page ? 'border-ink bg-ink text-white hover:text-white' : 'border-rule text-ink')}
              >
                {p}
              </Link>
            </li>
          ),
        )}
        <li>
          {page < totalPages ? (
            <Link href={href(page + 1)} rel="next" className={cn(linkBase, 'border-ink px-4')}>
              {copy.pagination.next}
            </Link>
          ) : (
            <span aria-disabled="true" className={cn(linkBase, 'border-rule px-4 text-faint')}>
              {copy.pagination.next}
            </span>
          )}
        </li>
      </ul>
    </nav>
  )
}
