import Link from 'next/link'

import { Avatar } from '@/components/Avatar'
import { copy } from '@/lib/copy'
import { toImage } from '@/lib/media'
import { isPublicPerson } from '@/lib/people'
import { firstName } from '@/lib/text'
import { routes } from '@/lib/url'
import type { Person } from '@/payload-types'

/** Sand "About the reporter" box under the story. */
export function AuthorBox({ person }: { person: Person }) {
  const city = typeof person.location === 'object' && person.location ? person.location.name : null
  const linked = isPublicPerson(person)
  const meta = [
    person.designation,
    city,
    person.pressCardStatus === 'active' ? copy.article.pressCardHolder : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <section
      className="flex flex-wrap items-start gap-5 bg-sand p-5 sm:p-7"
      aria-label={copy.article.aboutReporter}
    >
      <Avatar
        name={person.fullName}
        image={toImage(person.photo, 'portrait')}
        size={72}
        className="max-sm:hidden"
      />
      <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-2">
        <p className="kicker sm:text-xs">{copy.article.aboutReporter}</p>
        <p className="font-serif text-[21px] font-medium sm:text-2xl">{person.fullName}</p>
        <p className="text-sm text-subtle max-sm:hidden">{meta}</p>
        <p className="mt-1 text-sm leading-[1.55] text-body sm:text-[15px] sm:leading-[1.6]">
          <span className="sm:hidden">
            {[person.designation, city].filter(Boolean).join(', ')}.{' '}
          </span>
          {person.shortBio}
        </p>
        {linked ? (
          <Link
            href={routes.person(person.slug)}
            className="mt-1 text-sm font-semibold text-green-text"
          >
            {copy.article.moreStoriesBy(firstName(person.fullName))}
          </Link>
        ) : null}
      </div>
    </section>
  )
}
