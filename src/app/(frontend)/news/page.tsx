import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  ArticleArchive,
  pageParam,
  paginationMetadata,
  PaginationLinks,
} from '@/components/articles/ArticleArchive'
import { JsonLd } from '@/components/JsonLd'
import { copy } from '@/lib/copy'
import { breadcrumbJsonLd } from '@/lib/jsonld'
import { getCategories, getPersonBySlug, listArticles, PAGE_SIZE } from '@/lib/queries'
import { routes } from '@/lib/url'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

/** Optional ?author=slug filter (the no-JavaScript "Load more" on profile pages). */
async function authorParam(value: string | string[] | undefined) {
  const slug = Array.isArray(value) ? value[0] : value
  return slug && /^[a-z0-9-]{1,120}$/.test(slug) ? getPersonBySlug(slug) : null
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams
  const page = pageParam(sp.page)
  const author = await authorParam(sp.author)
  if (author) {
    return {
      title: copy.profile.articlesBy(author.fullName),
      alternates: { canonical: routes.person(author.slug) },
      robots: { index: false, follow: true },
    }
  }
  return {
    title: page > 1 ? `${copy.news.title} — ${copy.pagination.page(page)}` : copy.news.title,
    description: copy.news.intro,
    alternates: { canonical: page > 1 ? `${routes.news}?page=${page}` : routes.news },
  }
}

export default async function NewsPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = pageParam(sp.page)
  const author = await authorParam(sp.author)
  const [result, categories] = await Promise.all([
    listArticles({ page, limit: PAGE_SIZE, authorId: author?.id }),
    getCategories(),
  ])
  if (page > 1 && page > result.totalPages) notFound()
  const basePath = author ? `${routes.news}?author=${author.slug}` : routes.news
  const links = paginationMetadata(routes.news, page, result.totalPages)

  return (
    <>
      {!author && <PaginationLinks prev={links.prev} next={links.next} />}
      <ArticleArchive
        title={author ? copy.profile.articlesBy(author.fullName) : copy.news.title}
        description={author ? null : copy.news.intro}
        categories={categories}
        activeSlug={null}
        articles={result.docs}
        page={page}
        totalPages={result.totalPages}
        basePath={basePath}
      />
      <JsonLd data={breadcrumbJsonLd([{ name: copy.news.title, path: routes.news }])} />
    </>
  )
}
