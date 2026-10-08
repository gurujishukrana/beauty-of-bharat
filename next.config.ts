import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const mediaHost = process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL) : null

/**
 * Content Security Policy for the public site. Scripts are limited to our own origin plus
 * Cloudflare Turnstile; frames to the allowlisted video hosts. `'unsafe-inline'` for scripts is
 * required by Next.js's inline RSC payload on statically generated pages (nonces would force
 * every page to render dynamically).
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com" +
    (process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''),
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${mediaHost ? ` ${mediaHost.origin}` : ''}`,
  "font-src 'self'",
  "connect-src 'self' https://challenges.cloudflare.com",
  'frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://www.instagram.com https://challenges.cloudflare.com',
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(siteUrl.startsWith('https://') ? ['upgrade-insecure-requests'] : []),
].join('; ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  ...(siteUrl.startsWith('https://')
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/brand/**' }],
    remotePatterns: mediaHost
      ? [{ protocol: mediaHost.protocol.replace(':', '') as 'https' | 'http', hostname: mediaHost.hostname }]
      : [],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      // Admin gets the base headers only; Payload's admin UI manages its own scripts.
      { source: '/:path*', headers: securityHeaders },
      { source: '/((?!admin|api).*)', headers: [{ key: 'Content-Security-Policy', value: csp }] },
      {
        source: '/brand/:file*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: { root: path.resolve(dirname) },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
