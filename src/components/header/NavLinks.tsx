'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { copy } from '@/lib/copy'
import { cn } from '@/lib/cn'

export type NavLink = { label: string; url: string }

/** Whether `url` is the current section. News stays active on articles and category pages. */
export function isActive(url: string, pathname: string): boolean {
  if (url === '/') return pathname === '/'
  if (url === '/news')
    return (
      pathname === '/news' || pathname.startsWith('/news/') || pathname.startsWith('/category/')
    )
  return pathname === url || pathname.startsWith(`${url}/`)
}

export function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname() ?? '/'
  return (
    <nav aria-label={copy.nav.mainLabel}>
      <ul className="flex flex-wrap items-center gap-8 text-[15px] font-semibold">
        {links.map((link) => {
          const active = isActive(link.url, pathname)
          return (
            <li key={link.url}>
              <Link
                href={link.url}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block border-b-2 py-2.5',
                  active ? 'border-green text-green' : 'border-transparent text-ink',
                )}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
