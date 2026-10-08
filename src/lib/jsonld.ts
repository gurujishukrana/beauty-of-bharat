import type { Article, Person, SiteSetting } from '@/payload-types'

import { authorsOf, categoryOf, locationLabel, locationOf } from './cards'
import { copy } from './copy'
import { toImage } from './media'
import { absoluteUrl, getSiteUrl, routes } from './url'

const ORG_ID = () => `${getSiteUrl()}/#organization`

export function organizationJsonLd(settings: SiteSetting) {
  const sameAs = (settings.socialLinks ?? []).map((s) => s.url)
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    '@id': ORG_ID(),
    name: copy.siteName,
    url: getSiteUrl(),
    logo: { '@type': 'ImageObject', url: absoluteUrl('/icons/icon-512.png'), width: 512, height: 512 },
    description: settings.tagline,
    sameAs,
    publishingPrinciples: absoluteUrl(routes.about),
    correctionsPolicy: absoluteUrl(routes.about),
    actionableFeedbackPolicy: absoluteUrl(routes.contact),
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: copy.siteName,
    url: getSiteUrl(),
    publisher: { '@id': ORG_ID() },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${getSiteUrl()}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function personRef(p: Person) {
  return { '@type': 'Person', name: p.fullName, url: absoluteUrl(routes.person(p.slug)), jobTitle: p.designation }
}

export function articleJsonLd(article: Article, ogImageUrl: string) {
  const category = categoryOf(article)
  const location = locationOf(article)
  const hero = toImage(article.heroImage, 'hero')
  // Google asks for 16:9, 4:3 and 1:1 versions; the OG route renders crops of the hero.
  const images = [ogImageUrl, hero?.url ? absoluteUrl(hero.url) : null].filter(Boolean)
  const published = article.publishedAt || article.createdAt
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: absoluteUrl(routes.article(article.slug)),
    headline: article.title,
    description: article.seo?.metaDescription || article.deck,
    image: images,
    datePublished: published,
    dateModified: article.updatedAt,
    author: authorsOf(article).map(personRef),
    publisher: { '@id': ORG_ID(), '@type': 'NewsMediaOrganization', name: copy.siteName, logo: { '@type': 'ImageObject', url: absoluteUrl('/icons/icon-512.png') } },
    articleSection: category?.name,
    contentLocation: location ? { '@type': 'Place', name: locationLabel(location) } : undefined,
    isAccessibleForFree: true,
    inLanguage: 'en-IN',
    wordCount: article.plainText ? article.plainText.split(/\s+/).length : undefined,
  }
}

export function profileJsonLd(person: Person) {
  const photo = toImage(person.photo, 'portrait')
  const sameAs = (person.socialLinks ?? []).filter((s) => s.platform !== 'email').map((s) => s.url)
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: absoluteUrl(routes.person(person.slug)),
    mainEntity: {
      '@type': 'Person',
      name: person.fullName,
      jobTitle: person.designation,
      description: person.shortBio,
      image: photo ? absoluteUrl(photo.url) : undefined,
      worksFor: { '@id': ORG_ID(), '@type': 'NewsMediaOrganization', name: copy.siteName },
      homeLocation:
        typeof person.location === 'object' && person.location
          ? { '@type': 'Place', name: locationLabel(person.location) }
          : undefined,
      sameAs,
      url: absoluteUrl(routes.person(person.slug)),
    },
  }
}
