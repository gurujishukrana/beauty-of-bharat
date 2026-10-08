import type { Article, Category, Location, Person } from '@/payload-types'

import { formatDate, formatShortDate } from './dates'
import { toImage, type ImageData } from './media'
import { joinNames } from './text'
import { routes } from './url'

const asObject = <T extends object>(value: unknown): T | null =>
  typeof value === 'object' && value !== null ? (value as T) : null

export const categoryOf = (a: Pick<Article, 'primaryCategory'>) =>
  asObject<Category>(a.primaryCategory)
export const locationOf = (a: Pick<Article, 'location'>) => asObject<Location>(a.location)
export const authorsOf = (a: Pick<Article, 'authors'>) =>
  (a.authors ?? []).map((p) => asObject<Person>(p)).filter((p): p is Person => p !== null)

export const locationLabel = (l: Location | null | undefined) =>
  l ? l.displayName || [l.name, l.state].filter(Boolean).join(', ') : ''

/** Serializable story summary used by every card and list component. */
export type CardData = {
  id: number
  href: string
  title: string
  excerpt: string
  deck: string
  category: string
  categoryHref: string | null
  /** Full "Ludhiana, Punjab". */
  place: string
  /** City only, for compact kickers ("Education · Gaya"). */
  city: string
  authors: string
  date: string
  /** "8 October 2026" */
  dateLong: string
  dateISO: string
  readTime: number
  image: ImageData | null
}

export function toCard(article: Omit<Article, 'body' | 'plainText'>): CardData {
  const category = categoryOf(article)
  const location = locationOf(article)
  const date = article.publishedAt || article.createdAt
  return {
    id: article.id,
    href: routes.article(article.slug),
    title: article.title,
    excerpt: article.excerpt || article.deck || '',
    deck: article.deck || '',
    category: category?.name ?? '',
    categoryHref: category ? routes.category(category.slug) : null,
    place: locationLabel(location),
    city: location?.name ?? '',
    authors: joinNames(authorsOf(article).map((p) => p.fullName)),
    date: formatShortDate(date),
    dateLong: formatDate(date),
    dateISO: new Date(date).toISOString(),
    readTime: article.readTime ?? 1,
    image: toImage(article.heroImage, 'card'),
  }
}

/** "CATEGORY · PLACE" kicker text. */
export const kicker = (...parts: Array<string | null | undefined>) =>
  parts.filter(Boolean).join(' · ')
