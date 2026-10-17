import Link from 'next/link'

import { Avatar } from '@/components/Avatar'
import { PinIcon, ShieldCheckIcon, SOCIAL_ICONS, SOCIAL_LABELS } from '@/components/Icons'
import { locationLabel } from '@/lib/cards'
import { copy } from '@/lib/copy'
import { toImage } from '@/lib/media'
import { routes } from '@/lib/url'
import type { Person } from '@/payload-types'

export function socialHref(platform: string, url: string): string {
  return platform === 'email' && !url.startsWith('mailto:') ? `mailto:${url}` : url
}

/** People directory card: 4:5 portrait, press card line, name, role, place, bio, links. */
export function PersonCard({
  person,
  showCardNumber = false,
}: {
  person: Person
  /** Site settings → "Show press card numbers on the website". */
  showCardNumber?: boolean
}) {
  const href = routes.person(person.slug)
  const location = typeof person.location === 'object' ? person.location : null
  const socials = (person.socialLinks ?? []).filter((s) => s.platform !== 'email').slice(0, 3)
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
        {location ? (
          <p className="flex items-center gap-1 text-[13px] text-subtle">
            <PinIcon />
            {locationLabel(location)}
          </p>
        ) : null}
      </div>
      <p className="text-sm leading-[1.6] text-muted">{person.shortBio}</p>
      <div className="mt-auto flex items-center justify-between border-t border-rule pt-3">
        <Link href={href} className="text-sm font-semibold text-green-text">
          {copy.people.viewProfile}
        </Link>
        {socials.length > 0 && (
          <ul className="flex gap-1">
            {socials.map((s) => {
              const Icon = SOCIAL_ICONS[s.platform]
              return (
                <li key={s.id ?? s.url}>
                  <a
                    href={socialHref(s.platform, s.url)}
                    rel="noopener"
                    aria-label={`${person.fullName} on ${SOCIAL_LABELS[s.platform]}`}
                    className="flex h-11 w-11 items-center justify-center text-subtle hover:text-green"
                  >
                    <Icon />
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </article>
  )
}
