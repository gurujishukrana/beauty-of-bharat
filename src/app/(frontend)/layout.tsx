import type { Metadata, Viewport } from 'next'
import { Libre_Franklin, Newsreader } from 'next/font/google'
import type { ReactNode } from 'react'

import { JsonLd } from '@/components/JsonLd'
import { SiteHeader } from '@/components/header/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { copy } from '@/lib/copy'
import { organizationJsonLd, websiteJsonLd } from '@/lib/jsonld'
import { getSiteSettings } from '@/lib/queries'
import { toImage } from '@/lib/media'
import { absoluteUrl, getSiteUrl } from '@/lib/url'

import './globals.css'

const serif = Newsreader({
  subsets: ['latin'],
  style: ['normal'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-newsreader',
})

// Italic is only used for pull quotes and emphasis, so it is not preloaded.
const serifItalic = Newsreader({
  subsets: ['latin'],
  style: ['italic'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  variable: '--font-newsreader-italic',
})

const sans = Libre_Franklin({
  subsets: ['latin'],
  display: 'swap',
  // Not preloaded: headlines (serif) are the largest paint; UI text can swap in a moment later.
  preload: false,
  variable: '--font-libre-franklin',
})

// Pages are regenerated on demand when editors publish. This 5-minute fallback also picks up
// stories published by the scheduler on servers where on-demand revalidation can't run.
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  // Share image for pages without their own: Site settings → Default sharing image, or the
  // static logo card (public/og-default.png, made by `pnpm icons`).
  const defaultOg = toImage(settings.defaultOgImage, 'og')
  const shareImage = defaultOg
    ? {
        url: absoluteUrl(defaultOg.url),
        width: defaultOg.width,
        height: defaultOg.height,
        alt: defaultOg.alt,
      }
    : { url: absoluteUrl('/og-default.png'), width: 1200, height: 630, alt: copy.siteName }
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: `${copy.siteName} — uplifting stories from ground zero`,
      template: `%s | ${copy.siteName}`,
    },
    description: settings.tagline,
    applicationName: copy.siteName,
    alternates: {
      canonical: '/',
      types: { 'application/rss+xml': [{ url: '/rss.xml', title: copy.siteName }] },
    },
    openGraph: {
      type: 'website',
      siteName: copy.siteName,
      locale: 'en_IN',
      title: copy.siteName,
      description: settings.tagline,
      images: [shareImage],
    },
    twitter: { card: 'summary_large_image', images: [shareImage.url] },
    formatDetection: { telephone: false },
  }
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings()
  return (
    <html lang="en" className={`${serif.variable} ${serifItalic.variable} ${sans.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          {copy.skipToContent}
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        <SiteFooter />
        <JsonLd data={[organizationJsonLd(settings), websiteJsonLd()]} />
      </body>
    </html>
  )
}
