'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { copy } from '@/lib/copy'
import { cn } from '@/lib/cn'
import { routes } from '@/lib/url'

/** Horizontally scrollable list of sections under the masthead. */
export function CategoryBar({ categories }: { categories: { name: string; href: string }[] }) {
  const pathname = usePathname() ?? '/'
  const items = [{ name: copy.nav.allStories, href: routes.news }, ...categories]
  return (
    <nav aria-label={copy.nav.categoriesLabel} className="border-b border-rule sm:border-t">
      <ul className="container-site no-scrollbar flex gap-[22px] overflow-x-auto text-[13px] font-medium whitespace-nowrap text-body sm:gap-7">
        {items.map((item, i) => {
          const active = pathname === item.href
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block border-b-2 py-3 sm:py-[13px]',
                  active ? 'border-green text-green-text' : 'border-transparent text-body',
                )}
              >
                {i === 0 ? (
                  <>
                    <span className="sm:hidden">{copy.news.allTopics}</span>
                    <span className="max-sm:hidden">{item.name}</span>
                  </>
                ) : (
                  item.name
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
