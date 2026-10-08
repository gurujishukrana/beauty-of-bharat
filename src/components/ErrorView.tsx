import Link from 'next/link'
import type { ReactNode } from 'react'

import { SearchForm } from '@/components/SearchForm'
import { TricolourRule } from '@/components/TricolourRule'
import { copy } from '@/lib/copy'
import { routes } from '@/lib/url'

/** Shared layout for the 404 and 500 pages: message, search box, links to Home and Latest news. */
export function ErrorView({
  kicker,
  title,
  text,
  action,
}: {
  kicker: string
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <section className="container-site py-14 sm:py-24">
      <div className="flex max-w-[760px] flex-col gap-5">
        <TricolourRule variant="short" />
        <p className="kicker text-xs">{kicker}</p>
        <h1 className="font-serif text-[36px] leading-[1.04] font-medium tracking-[-0.015em] sm:text-[60px]">
          {title}
        </h1>
        <p className="max-w-[620px] text-[17px] leading-[1.6] text-body sm:text-lg">{text}</p>
        <SearchForm className="mt-3" id="error-search" />
        <div className="mt-3 flex flex-wrap gap-3">
          {action}
          <Link
            href={routes.home}
            className="inline-flex items-center rounded-xs bg-ink px-6 py-3.5 text-[15px] font-semibold text-white hover:text-white"
          >
            {copy.notFound.home}
          </Link>
          <Link
            href={routes.news}
            className="inline-flex items-center rounded-xs border-[1.5px] border-ink px-6 py-[13px] text-[15px] font-semibold text-ink"
          >
            {copy.notFound.latest}
          </Link>
        </div>
      </div>
    </section>
  )
}
