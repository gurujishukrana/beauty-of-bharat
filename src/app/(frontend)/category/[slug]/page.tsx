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
import { getCategories, getCategoryBySlug, listArticles, PAGE_SIZE } from '@/lib/queries'
import { routes } from '@/lib/url'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  const page = pageParam(sp.page)
  const path = routes.category(category.slug)
  return {
    title: page > 1 ? `${category.name} — ${copy.pagination.page(page)}` : category.name,
    description: category.description || `${category.name} stories from Beauty of Bharat.`,
    alternates: { canonical: page > 1 ? `${path}?page=${page}` : path },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()
  const page = pageParam(sp.page)
  const path = routes.category(category.slug)
  const [result, categories] = await Promise.all([
    listArticles({ categoryId: category.id, page, limit: PAGE_SIZE }),
    getCategories(),
  ])
  if (page > 1 && page > result.totalPages) notFound()
  const links = paginationMetadata(path, page, result.totalPages)

  return (
    <>
      <PaginationLinks prev={links.prev} next={links.next} />
      <ArticleArchive
        kicker={copy.news.title}
        title={category.name}
        description={category.description}
        categories={categories}
        activeSlug={category.slug}
        articles={result.docs}
        page={page}
        totalPages={result.totalPages}
        basePath={path}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: copy.news.title, path: routes.news },
          { name: category.name, path },
        ])}
      />
    </>
  )
}
