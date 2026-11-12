import Link from 'next/link'

import { Avatar } from '@/components/Avatar'
import { ShieldCheckIcon } from '@/components/Icons'
import { copy } from '@/lib/copy'
import { toImage } from '@/lib/media'
import { routes } from '@/lib/url'
import type { Person } from '@/payload-types'

/** People directory card: 4:5 portrait, press card line, name and designation. */
export function PersonCard({
  person,
  showCardNumber = false,
}: {
  person: Person
  /** Site settings → "Show press card numbers on the website". */
  showCardNumber?: boolean
}) {
  const href = routes.person(person.slug)
  return (
    <article className="flex flex-col gap-3.5">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
        <Avatar
          name={person.fullName}
          image={toImage(person.photo, 'portrait')}
          shape="portrait"
          sizes="(max-width: 759px) 100vw, (max-width: 1100px) 50vw, 300px"
          className="w-full text-[56px]"
        />
      </Link>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-green-text">
        <ShieldCheckIcon />
        {showCardNumber && person.pressCardNumber
          ? `${copy.people.pressCard} · ${person.pressCardNumber}`
          : copy.article.pressCardHolder}
      </p>
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-[25px] leading-[1.15] font-medium">
          <Link href={href} className="text-ink hover:text-green">
            {person.fullName}
          </Link>
        </h2>
        <p className="text-sm font-semibold text-body">{person.designation}</p>
      </div>
    </article>
  )
}
