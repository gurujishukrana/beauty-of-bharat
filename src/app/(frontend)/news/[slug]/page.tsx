import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'

import { AuthorBox } from '@/components/article/AuthorBox'
import { FigCaption } from '@/components/article/Figure'
import { NativeShareButton, ShareButtons, ShareRow } from '@/components/article/ShareButtons'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { Avatar } from '@/components/Avatar'
import { JsonLd } from '@/components/JsonLd'
import { MediaImage } from '@/components/MediaImage'
import { PreviewBar } from '@/components/PreviewBar'
import { RichText } from '@/components/RichText'
import { SectionHeader } from '@/components/SectionHeader'
import { ViewCounter } from '@/components/ViewCounter'
import { authorsOf, categoryOf, kicker, locationLabel, locationOf, toCard } from '@/lib/cards'
import { copy } from '@/lib/copy'
import { formatDate, formatShortDate } from '@/lib/dates'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/jsonld'
import { toImage } from '@/lib/media'
import { isPublicPerson } from '@/lib/people'
import {
  getArticleBySlug,
  getPayloadClient,
  getRelatedArticles,
  getSiteSettings,
} from '@/lib/queries'
import { findRedirect } from '@/lib/redirects'
import { absoluteUrl, correctionUrl, routes } from '@/lib/url'
import type { Category } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    where: { _status: { equals: 'published' } },
    limit: 200,
    sort: '-publishedAt',
    depth: 0,
    select: { slug: true },
  })
  return docs.map(({ slug }) => ({ slug }))
}

async function load(params: Props['params']) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  return { slug, draft, article: await getArticleBySlug(decodeURIComponent(slug), draft) }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { article } = await load(params)
  if (!article) return {}
  const category = categoryOf(article)
  const path = routes.article(article.slug)
  const ogImage = toImage(article.seo?.ogImage, 'og') ?? toImage(article.heroImage, 'og')
  const description = article.seo?.metaDescription || article.deck
  const title = article.seo?.metaTitle || article.title
  const images = ogImage
    ? [
        {
          url: absoluteUrl(ogImage.url),
          width: ogImage.width,
          height: ogImage.height,
          alt: ogImage.alt,
        },
      ]
    : [{ url: absoluteUrl(`${path}/og`), width: 1200, height: 630, alt: article.title }]
  return {
    title,
    description,
    alternates: { canonical: article.seo?.canonicalUrl || path },
    robots: article.seo?.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'article',
      title,
      description,
      url: path,
      images,
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      authors: authorsOf(article).map((p) => absoluteUrl(routes.person(p.slug))),
      section: category?.name,
    },
    twitter: { card: 'summary_large_image', title, description, images: images.map((i) => i.url) },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug, draft, article } = await load(params)
  if (!article) {
    const target = await findRedirect(routes.article(slug))
    if (target) permanentRedirect(target)
    notFound()
  }

  const settings = await getSiteSettings()
  const category = categoryOf(article)
  const location = locationOf(article)
  const authors = authorsOf(article)
  const lead = authors[0]
  const path = routes.article(article.slug)
  const url = absoluteUrl(path)
  const hero = toImage(article.heroImage, 'hero')
  const published = article.publishedAt || article.createdAt
  const showUpdated =
    article.updatedNote &&
    new Date(article.updatedAt).getTime() - new Date(published).getTime() > 60_000
  const related = (await getRelatedArticles(article)).map(toCard)
  const tags = [
    ...[category, ...(article.categories ?? [])].filter(
      (c, i, all): c is Category =>
        typeof c === 'object' &&
        c !== null &&
        all.findIndex((x) => typeof x === 'object' && x?.id === c.id) === i,
    ),
  ]
  const ogUrl = absoluteUrl(
    toImage(article.seo?.ogImage, 'og')?.url ??
      toImage(article.heroImage, 'og')?.url ??
      `${path}/og`,
  )

  const bylineNames = authors.map((p) =>
    isPublicPerson(p) ? (
      <Link key={p.id} href={routes.person(p.slug)} className="text-ink hover:text-green">
        {p.fullName}
      </Link>
    ) : (
      <span key={p.id}>{p.fullName}</span>
    ),
  )

  return (
    <>
      {draft && <PreviewBar path={path} />}
      {settings.homepage?.mostReadMode === 'views' && !draft && <ViewCounter slug={article.slug} />}
      <article>
        <header className="mx-auto flex max-w-[860px] flex-col gap-3.5 px-4 pt-[22px] pb-[18px] sm:gap-5 sm:px-10 sm:pt-12 sm:pb-8">
          <nav aria-label="Breadcrumb" className="text-[13px] text-subtle max-sm:hidden">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link href={routes.news} className="text-subtle">
                  {copy.nav.news}
                </Link>
              </li>
              {category ? (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link
                      href={routes.category(category.slug)}
                      className="font-semibold text-green-text"
                    >
                      {category.name}
                    </Link>
                  </li>
                </>
              ) : null}
            </ol>
          </nav>
          <p className="kicker sm:hidden">{kicker(category?.name, locationLabel(location))}</p>
          <h1 className="font-serif text-[33px] leading-[1.08] font-medium sm:text-[56px] sm:leading-[1.05] sm:tracking-[-0.015em]">
            {article.title}
          </h1>
          <p className="font-serif text-[19px] leading-[1.4] text-body sm:text-[23px]">
            {article.deck}
          </p>

          <div className="mt-0 flex flex-wrap items-center justify-between gap-4 border-y border-rule py-3 sm:mt-2 sm:py-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {lead ? (
                <Avatar
                  name={lead.fullName}
                  image={toImage(lead.photo, 'portrait')}
                  size={44}
                  className="max-sm:h-[38px]! max-sm:w-[38px]! max-sm:text-[15px]!"
                />
              ) : null}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold sm:text-[15px]">
                  <span className="max-sm:hidden">{copy.article.by} </span>
                  {bylineNames.length > 1
                    ? bylineNames.flatMap((node, i) => [
                        i > 0
                          ? i === bylineNames.length - 1
                            ? ` ${copy.article.and} `
                            : ', '
                          : null,
                        node,
                      ])
                    : bylineNames}
                </span>
                <span className="text-xs text-subtle sm:text-[13px]">
                  <time dateTime={new Date(published).toISOString()}>
                    <span className="sm:hidden">{formatShortDate(published)}</span>
                    <span className="max-sm:hidden">{formatDate(published)}</span>
                  </time>
                  {showUpdated ? (
                    <>
                      {' '}
                      · {copy.article.updated}{' '}
                      <time dateTime={new Date(article.updatedAt).toISOString()}>
                        {formatDate(article.updatedAt)}
                      </time>
                    </>
                  ) : null}
                  {location ? (
                    <span className="max-sm:hidden"> · {locationLabel(location)}</span>
                  ) : null}
                  {' · '}
                  {copy.article.minRead(article.readTime ?? 1)}
                </span>
              </div>
            </div>
            <div className="max-sm:hidden">
              <ShareButtons url={url} title={article.title} />
            </div>
            <div className="sm:hidden">
              <NativeShareButton url={url} title={article.title} />
            </div>
          </div>
        </header>

        <figure className="mx-auto box-border max-w-[1280px] sm:px-10">
          <MediaImage
            image={hero}
            aspect="16/8"
            sizes="(max-width: 1280px) 100vw, 1200px"
            priority
            rounded={false}
            className="max-sm:aspect-[4/3]! sm:rounded-xs"
          />
          <FigCaption
            caption={article.heroCaption ?? hero?.caption}
            credit={article.heroCredit ?? hero?.credit}
            className="mx-auto max-w-[780px] px-4 sm:px-0"
          />
        </figure>

        <div className="px-4 pt-6 pb-2 sm:px-10 sm:pt-12 sm:pb-6">
          <RichText data={article.body} className="article-body has-dropcap" />
        </div>

        <footer className="mx-auto flex max-w-[700px] flex-col gap-5 px-4 pt-2 pb-8 sm:box-content sm:gap-7 sm:px-10 sm:pb-14">
          {(tags.length > 0 || location) && (
            <ul className="flex flex-wrap gap-2.5 max-sm:hidden">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <Link
                    href={routes.category(tag.slug)}
                    className="block rounded-full border border-rule px-3.5 py-2 text-[13px] font-medium text-ink"
                  >
                    {tag.name}
                  </Link>
                </li>
              ))}
              {location?.state ? (
                <li>
                  <Link
                    href={`/search?q=${encodeURIComponent(location.name)}`}
                    className="block rounded-full border border-rule px-3.5 py-2 text-[13px] font-medium text-ink"
                  >
                    {location.name}
                  </Link>
                </li>
              ) : null}
            </ul>
          )}
          {authors.map((person) => (
            <AuthorBox key={person.id} person={person} />
          ))}
          <ShareRow url={url} title={article.title} className="sm:hidden" />
          <Link href={correctionUrl(url)} className="text-[13px] text-subtle">
            {copy.article.spottedError}{' '}
            <span className="underline underline-offset-[3px]">
              {copy.article.requestCorrection}
            </span>
          </Link>
        </footer>
      </article>

      {related.length > 0 && (
        <section className="sm:border-t sm:border-rule" aria-label={copy.article.relatedStories}>
          <div className="container-site pt-8 pb-8 sm:pt-12 sm:pb-[72px]">
            <SectionHeader
              title={copy.article.relatedStories}
              href={routes.news}
              linkLabel={copy.article.backToNews}
              size="md"
              className="mb-1 sm:mb-7 [&_a]:max-sm:hidden"
            />
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
              {related.map((card) => (
                <ArticleCard key={card.id} card={card} variant="related" compactOnMobile />
              ))}
            </div>
            <Link
              href={routes.news}
              className="mt-[18px] block text-sm font-semibold text-green-text sm:hidden"
            >
              {copy.article.backToNews}
            </Link>
          </div>
        </section>
      )}

      <JsonLd
        data={[
          articleJsonLd(article, ogUrl),
          breadcrumbJsonLd([
            { name: copy.nav.news, path: routes.news },
            ...(category ? [{ name: category.name, path: routes.category(category.slug) }] : []),
            { name: article.title, path },
          ]),
        ]}
      />
    </>
  )
}
