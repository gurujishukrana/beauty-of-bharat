import Link from 'next/link'

import { Avatar } from '@/components/Avatar'
import { copy } from '@/lib/copy'
import { toImage } from '@/lib/media'
import type { Person } from '@/payload-types'
import { routes } from '@/lib/url'

/** Sand band introducing the team, with round avatars linking to profiles. */
export function PeopleBand({ people }: { people: Person[] }) {
  if (!people.length) return null
  return (
    <section className="bg-sand" aria-labelledby="people-band-title">
      <div className="container-site flex flex-wrap items-center gap-3.5 py-8 sm:gap-12 sm:py-[72px]">
        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-3.5 sm:gap-[18px]">
          <p className="kicker sm:text-xs">{copy.home.peopleKicker}</p>
          <h2
            id="people-band-title"
            className="font-serif text-[26px] leading-[1.15] font-medium sm:text-[38px] sm:leading-[1.12]"
          >
            {copy.home.peopleTitle}
          </h2>
          <p className="text-base leading-[1.6] text-body max-sm:hidden">{copy.home.peopleText}</p>
          <div className="max-sm:hidden">
            <Link
              href={routes.people}
              className="inline-flex items-center gap-2.5 rounded-xs border-[1.5px] border-ink px-[22px] py-[13px] text-[15px] font-semibold text-ink"
            >
              {copy.home.meetTeam}
            </Link>
          </div>
        </div>
        <ul className="no-scrollbar flex min-w-0 flex-[1.4_1_480px] gap-3.5 overflow-x-auto py-1.5 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(110px,1fr))] sm:gap-6 md:grid-cols-5 sm:overflow-visible">
          {people.map((person) => {
            const city =
              typeof person.location === 'object' && person.location ? person.location.name : ''
            return (
              <li key={person.id} className="w-[78px] shrink-0 sm:w-auto">
                <Link
                  href={routes.person(person.slug)}
                  className="group flex flex-col items-center gap-2 sm:gap-2.5"
                >
                  <Avatar
                    name={person.fullName}
                    image={toImage(person.photo, 'portrait')}
                    sizes="(max-width: 759px) 68px, 180px"
                    className="w-[68px] text-[22px] sm:w-full sm:text-[30px]"
                  />
                  <span className="text-center text-xs leading-[1.3] font-semibold text-ink group-hover:text-green sm:text-sm">
                    {person.fullName}
                  </span>
                  {city ? (
                    <span className="-mt-1.5 text-center text-xs text-subtle max-sm:hidden">
                      {city}
                    </span>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
        <Link
          href={routes.people}
          className="flex h-12 w-full items-center justify-center rounded-xs border-[1.5px] border-ink text-[15px] font-semibold text-ink sm:hidden"
        >
          {copy.home.meetTeamShort}
        </Link>
      </div>
    </section>
  )
}
