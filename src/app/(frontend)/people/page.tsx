import type { Metadata } from 'next'
import Link from 'next/link'

import { SearchIcon, ShieldCheckIcon } from '@/components/Icons'
import { JsonLd } from '@/components/JsonLd'
import { PersonCard } from '@/components/people/PersonCard'
import { copy } from '@/lib/copy'
import { cn } from '@/lib/cn'
import { breadcrumbJsonLd } from '@/lib/jsonld'
import { filterPeople, parsePeopleFilters, peopleHref, ROLE_FILTERS } from '@/lib/people'
import { getPublicPeople } from '@/lib/queries'
import { routes } from '@/lib/url'

export const metadata: Metadata = {
  title: copy.people.title,
  description: copy.people.intro,
  alternates: { canonical: routes.people },
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function PeoplePage({ searchParams }: Props) {
  const filters = parsePeopleFilters(await searchParams)
  const everyone = await getPublicPeople()
  const people = filterPeople(everyone, filters)

  // Role chips for roles that have people, plus the two states with the most people.
  const roles = ROLE_FILTERS.filter((r) => everyone.some((p) => p.roleType === r.value))
  const stateCounts = new Map<string, number>()
  for (const p of everyone) {
    const state = typeof p.location === 'object' ? p.location?.state : null
    if (state) stateCounts.set(state, (stateCounts.get(state) ?? 0) + 1)
  }
  const states = [...stateCounts.entries()]
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([state]) => state)

  const chips = [
    { label: copy.people.everyone, href: peopleHref({ q: filters.q }), active: !filters.role && !filters.state },
    ...roles.map((r) => ({
      label: r.label,
      href: peopleHref({ role: r.value, q: filters.q }),
      active: filters.role === r.value,
    })),
    ...states.map((s) => ({
      label: s,
      href: peopleHref({ state: s.toLowerCase(), q: filters.q }),
      active: filters.state === s.toLowerCase(),
    })),
  ]

  return (
    <>
      <section className="container-site flex flex-wrap items-end gap-8 pt-10 pb-8 sm:gap-12 sm:pt-16 sm:pb-10">
        <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-4 sm:gap-[18px]">
          <p className="kicker sm:text-xs">{copy.people.kicker}</p>
          <h1 className="font-serif text-[36px] leading-[1.04] font-medium tracking-[-0.015em] sm:text-[60px]">
            {copy.people.title}
          </h1>
          <p className="max-w-[640px] text-[17px] leading-[1.6] text-body sm:text-lg">{copy.people.intro}</p>
        </div>
        <aside className="flex min-w-0 flex-[1_1_320px] items-start gap-3.5 border border-rule p-[22px]">
          <ShieldCheckIcon size={28} strokeWidth={1.8} className="shrink-0 text-green-text" />
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[15px] font-bold">{copy.people.verifyTitle}</h2>
            <p className="text-sm leading-[1.55] text-muted">
              {copy.people.verifyText}{' '}
              <Link href={routes.contact} className="text-green-text underline underline-offset-[3px]">
                {copy.people.verifyLink}
              </Link>
              .
            </p>
          </div>
        </aside>
      </section>

      <section className="container-site">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-ink border-b border-b-rule py-4">
          <nav aria-label={copy.people.filtersLabel}>
            <ul className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <li key={chip.href + chip.label}>
                  <Link
                    href={chip.href}
                    aria-current={chip.active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center rounded-full border px-4 text-sm font-medium',
                      chip.active ? 'border-ink bg-ink text-white hover:text-white' : 'border-chip bg-paper text-ink',
                    )}
                  >
                    {chip.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <form action={routes.people} method="get" role="search" className="w-full sm:w-auto">
            {filters.role ? <input type="hidden" name="role" value={filters.role} /> : null}
            {filters.state ? <input type="hidden" name="state" value={filters.state} /> : null}
            <label className="flex h-11 items-center gap-2.5 rounded-xs border border-chip px-3.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-green sm:min-w-[260px]">
              <SearchIcon size={16} className="text-subtle" />
              <span className="sr-only">{copy.people.searchLabel}</span>
              <input
                type="search"
                name="q"
                defaultValue={filters.q}
                placeholder={copy.people.searchLabel}
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-subtle"
              />
              <button type="submit" className="sr-only">
                {copy.people.searchButton}
              </button>
            </label>
          </form>
        </div>
      </section>

      <section className="container-site pt-8 pb-14 sm:pt-10 sm:pb-20">
        <p aria-live="polite" className="sr-only">
          {people.length} {people.length === 1 ? 'person' : 'people'}
        </p>
        {people.length ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 min-[560px]:grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(270px,1fr))]">
            {people.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 py-6">
            <p className="text-body">{copy.people.empty}</p>
            <Link href={routes.people} className="text-sm font-semibold text-green-text">
              {copy.people.clear}
            </Link>
          </div>
        )}
      </section>
      <JsonLd data={breadcrumbJsonLd([{ name: copy.nav.people, path: routes.people }])} />
    </>
  )
}
