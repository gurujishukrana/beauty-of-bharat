import type { Metadata } from 'next'
import Link from 'next/link'

import { Avatar } from '@/components/Avatar'
import { Highlight } from '@/components/Highlight'
import { MediaImage } from '@/components/MediaImage'
import { SearchForm } from '@/components/SearchForm'
import { kicker, locationLabel, toCard } from '@/lib/cards'
import { copy } from '@/lib/copy'
import { toImage } from '@/lib/media'
import { searchSite } from '@/lib/queries'
import { excerptAround } from '@/lib/text'
import { routes } from '@/lib/url'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = (await searchParams).q
  const query = (Array.isArray(q) ? q[0] : q)?.trim()
  return {
    title: query ? copy.search.resultsFor(query.slice(0, 60)) : copy.search.title,
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const raw = (await searchParams).q
  const query = (Array.isArray(raw) ? raw[0] : (raw ?? '')).trim().slice(0, 100)
  const { terms, articles, people } = query
    ? await searchSite(query)
    : { terms: [], articles: [], people: [] }
  const total = articles.length + people.length

  return (
    <>
      <section className="container-site flex flex-col gap-5 pt-10 pb-8 sm:pt-16 sm:pb-10">
        <h1 className="font-serif text-[36px] leading-[1.04] font-medium tracking-[-0.015em] sm:text-[52px]">
          {query ? copy.search.resultsFor(query) : copy.search.title}
        </h1>
        <SearchForm defaultValue={query} autoFocus={!query} id="search-page" />
        <p aria-live="polite" className="text-[15px] text-subtle">
          {!query
            ? copy.search.prompt
            : total === 0
              ? copy.search.none
              : `${articles.length} ${articles.length === 1 ? 'story' : 'stories'} and ${people.length} ${people.length === 1 ? 'person' : 'people'}`}
        </p>
      </section>

      {total > 0 && (
        <div className="container-site flex flex-wrap gap-12 pb-16 sm:pb-20">
          {articles.length > 0 && (
            <section className="min-w-0 flex-[2_1_520px]" aria-labelledby="stories-heading">
              <h2
                id="stories-heading"
                className="border-t-2 border-ink pt-4 font-serif text-[26px] font-medium sm:text-[30px]"
              >
                {copy.search.stories}
              </h2>
              <ul>
                {articles.map((article) => {
                  const card = toCard(article)
                  return (
                    <li key={article.id} className="border-b border-rule">
                      <Link href={card.href} className="group flex items-start gap-4 py-5 sm:gap-5">
                        <MediaImage
                          image={card.image}
                          aspect="4/3"
                          sizes="140px"
                          className="w-24 shrink-0 sm:w-[140px]"
                        />
                        <div className="flex min-w-0 flex-col gap-1.5">
                          <p className="kicker">{kicker(card.category, card.place)}</p>
                          <h3 className="font-serif text-[19px] leading-[1.25] font-medium text-ink group-hover:text-green sm:text-[22px]">
                            <Highlight text={card.title} terms={terms} />
                          </h3>
                          <p className="text-sm leading-[1.55] text-muted max-sm:hidden">
                            <Highlight
                              text={excerptAround(article.plainText || article.deck, terms)}
                              terms={terms}
                            />
                          </p>
                          <p className="text-[13px] text-subtle">
                            {card.authors} · <time dateTime={card.dateISO}>{card.date}</time>
                          </p>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
          {people.length > 0 && (
            <section className="min-w-0 flex-[1_1_300px]" aria-labelledby="people-heading">
              <h2
                id="people-heading"
                className="border-t-2 border-ink pt-4 font-serif text-[26px] font-medium sm:text-[30px]"
              >
                {copy.search.people}
              </h2>
              <ul>
                {people.map((person) => (
                  <li key={person.id} className="border-b border-rule">
                    <Link
                      href={routes.person(person.slug)}
                      className="group flex items-center gap-4 py-4"
                    >
                      <Avatar
                        name={person.fullName}
                        image={toImage(person.photo, 'portrait')}
                        size={56}
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-serif text-xl font-medium text-ink group-hover:text-green">
                          <Highlight text={person.fullName} terms={terms} />
                        </span>
                        <span className="text-[13px] text-subtle">
                          <Highlight
                            text={[
                              person.designation,
                              typeof person.location === 'object'
                                ? locationLabel(person.location)
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                            terms={terms}
                          />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  )
}
