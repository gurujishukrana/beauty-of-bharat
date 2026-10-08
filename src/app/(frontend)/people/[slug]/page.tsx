import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleListItem } from '@/components/articles/ArticleListItem'
import { Avatar } from '@/components/Avatar'
import { PinIcon, SOCIAL_ICONS, SOCIAL_LABELS } from '@/components/Icons'
import { JsonLd } from '@/components/JsonLd'
import { LoadMore } from '@/components/LoadMore'
import { Mark } from '@/components/Logo'
import { socialHref } from '@/components/people/PersonCard'
import { PreviewBar } from '@/components/PreviewBar'
import { RichText } from '@/components/RichText'
import { kicker, locationLabel, toCard } from '@/lib/cards'
import { copy } from '@/lib/copy'
import { formatMonthYear } from '@/lib/dates'
import { breadcrumbJsonLd, profileJsonLd } from '@/lib/jsonld'
import { toImage } from '@/lib/media'
import { getPayloadClient, getPersonBySlug, listArticles } from '@/lib/queries'
import { firstName } from '@/lib/text'
import { absoluteUrl, routes } from '@/lib/url'

type Props = { params: Promise<{ slug: string }> }

const ARTICLES_PER_PAGE = 5

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'people',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { pressCardStatus: { equals: 'active' } },
        { showOnPeoplePage: { equals: true } },
      ],
    },
    limit: 500,
    depth: 0,
    select: { slug: true },
  })
  return docs.map(({ slug }) => ({ slug }))
}

async function load(params: Props['params']) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  // Hidden, suspended or revoked profiles are filtered out here, so they 404.
  return { draft, person: await getPersonBySlug(decodeURIComponent(slug), draft) }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { person } = await load(params)
  if (!person) return {}
  const path = routes.person(person.slug)
  const photo = toImage(person.photo, 'og')
  const title = `${person.fullName}, ${person.designation}`
  return {
    title,
    description: person.shortBio,
    alternates: { canonical: path },
    openGraph: {
      type: 'profile',
      title,
      description: person.shortBio,
      url: path,
      images: [
        photo
          ? {
              url: absoluteUrl(photo.url),
              width: photo.width,
              height: photo.height,
              alt: person.fullName,
            }
          : { url: absoluteUrl(`${path}/og`), width: 1200, height: 630, alt: person.fullName },
      ],
    },
  }
}

export default async function ProfilePage({ params }: Props) {
  const { draft, person } = await load(params)
  if (!person) notFound()

  const path = routes.person(person.slug)
  const location = typeof person.location === 'object' ? person.location : null
  const articles = await listArticles({ authorId: person.id, limit: ARTICLES_PER_PAGE })
  const name = firstName(person.fullName)
  const socials = person.socialLinks ?? []
  const hasBio = Boolean(person.bio?.root?.children?.length)

  return (
    <>
      {draft && <PreviewBar path={path} />}
      <nav aria-label="Breadcrumb" className="container-site pt-6 text-[13px] text-subtle sm:pt-7">
        <ol className="flex gap-2">
          <li>
            <Link href={routes.people} className="text-subtle">
              {copy.nav.people}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {person.fullName}
          </li>
        </ol>
      </nav>

      <section className="container-site flex flex-wrap items-start gap-8 pt-6 pb-14 sm:gap-14 sm:pt-9 sm:pb-16">
        <div className="flex min-w-[260px] flex-[0_1_380px] flex-col gap-5 max-sm:w-full max-sm:flex-auto">
          <Avatar
            name={person.fullName}
            image={toImage(person.photo, 'portrait')}
            shape="portrait"
            sizes="(max-width: 759px) 100vw, 380px"
            priority
            className="w-full text-[80px]"
          />
          <section
            aria-label={copy.profile.officialCard}
            className="flex flex-col gap-3.5 border border-rule p-5"
          >
            <div className="flex items-center gap-2.5">
              <Mark size={28} />
              <div className="flex flex-col">
                <span className="text-[13px] font-bold">{copy.profile.officialCard}</span>
                <span className="text-xs text-subtle">{copy.profile.issuedBy}</span>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-[13px]">
              <div className="flex flex-col gap-0.5">
                <dt className="text-subtle">{copy.profile.cardNumber}</dt>
                <dd className="font-semibold">{person.pressCardNumber}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-subtle">{copy.profile.status}</dt>
                <dd className="font-semibold text-green-text capitalize">
                  {person.pressCardStatus}
                </dd>
              </div>
              {person.dateJoined ? (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-subtle">{copy.profile.joined}</dt>
                  <dd className="font-semibold">{formatMonthYear(person.dateJoined)}</dd>
                </div>
              ) : null}
              {location ? (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-subtle">{copy.profile.basedIn}</dt>
                  <dd className="font-semibold">{location.name}</dd>
                </div>
              ) : null}
            </dl>
          </section>
        </div>

        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-5 sm:pt-2">
          <p className="kicker sm:text-xs">{person.designation}</p>
          <h1 className="font-serif text-[40px] leading-none font-medium tracking-[-0.015em] sm:text-[64px]">
            {person.fullName}
          </h1>
          {location ? (
            <p className="flex items-center gap-1.5 text-[15px] text-subtle">
              <PinIcon size={15} />
              {locationLabel(location)}
            </p>
          ) : null}
          <div className="prose-simple mt-2 max-w-[680px] font-serif text-[19px] leading-[1.55] text-ink-2 sm:text-[22px] [&_a]:text-green-text [&_a]:underline">
            {hasBio ? <RichText data={person.bio} /> : <p>{person.shortBio}</p>}
          </div>
          {socials.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2.5">
              {socials.map((s) => {
                const Icon = SOCIAL_ICONS[s.platform]
                return (
                  <li key={s.id ?? s.url}>
                    <a
                      href={socialHref(s.platform, s.url)}
                      rel="me noopener"
                      className="inline-flex min-h-11 items-center gap-2 rounded-xs border border-chip px-4 text-sm font-medium text-ink"
                    >
                      <Icon />
                      {s.platform === 'email'
                        ? copy.profile.email(name)
                        : SOCIAL_LABELS[s.platform]}
                    </a>
                  </li>
                )
              })}
            </ul>
          )}

          <section className="mt-8" aria-labelledby="articles-by">
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-3 border-t-2 border-ink pt-4">
              <h2 id="articles-by" className="font-serif text-[26px] font-medium sm:text-[30px]">
                {copy.profile.articlesBy(person.fullName)}
              </h2>
              <span className="text-[13px] text-subtle">{copy.profile.newestFirst}</span>
            </div>
            {articles.docs.length ? (
              <>
                {articles.docs.map((article) => {
                  const card = toCard(article)
                  return (
                    <ArticleListItem
                      key={article.id}
                      card={card}
                      showAuthor={false}
                      thumbWidth={156}
                      label={kicker(card.category, card.city)}
                    />
                  )
                })}
                {articles.hasNextPage && (
                  <LoadMore
                    exclude={articles.docs.map((a) => a.id)}
                    authorId={person.id}
                    limit={ARTICLES_PER_PAGE}
                    layout="list"
                    align="start"
                    label={copy.profile.loadMore}
                    fallbackHref={`${routes.news}?author=${person.slug}`}
                  />
                )}
              </>
            ) : (
              <p className="py-6 text-body">{copy.profile.noArticles}</p>
            )}
          </section>
        </div>
      </section>
      <JsonLd
        data={[
          profileJsonLd(person),
          breadcrumbJsonLd([
            { name: copy.nav.people, path: routes.people },
            { name: person.fullName, path },
          ]),
        ]}
      />
    </>
  )
}
