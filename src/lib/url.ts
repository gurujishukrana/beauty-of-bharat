/** Public site URL without a trailing slash. */
export function getSiteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '')
  return (fromEnv || 'http://localhost:3000').replace(/\/+$/, '')
}

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path
  return `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`
}

export const routes = {
  home: '/',
  news: '/news',
  article: (slug: string) => `/news/${slug}`,
  category: (slug: string) => `/category/${slug}`,
  people: '/people',
  person: (slug: string) => `/people/${slug}`,
  about: '/about',
  contact: '/contact',
  search: '/search',
  privacy: '/privacy',
  terms: '/terms',
} as const

/** Contact page pre-filled for a correction to `articleUrl`. */
export const correctionUrl = (articleUrl: string) =>
  `/contact?topic=correction&article=${encodeURIComponent(articleUrl)}`

/** wa.me link from a display number such as "+91 98765 43210". */
export function whatsappLink(number: string | null | undefined): string | null {
  const digits = (number ?? '').replace(/\D/g, '')
  return digits.length >= 8 ? `https://wa.me/${digits}` : null
}
