import path from 'path'
import { fileURLToPath } from 'url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { buildConfig, type PayloadRequest } from 'payload'
import sharp from 'sharp'

import { simpleEditor } from './blocks/richText'
import { Articles } from './collections/Articles'
import { ArticleViews } from './collections/ArticleViews'
import { Categories } from './collections/Categories'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { Locations } from './collections/Locations'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { People } from './collections/People'
import { Users } from './collections/Users'
import { Navigation } from './globals/Navigation'
import { SiteSettings } from './globals/SiteSettings'
import { EVERYTHING, revalidate } from './hooks/revalidate'
import { getSiteUrl } from './lib/url'
import { migrations } from './migrations'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const isServerless = Boolean(process.env.VERCEL)

/**
 * Vercel Blob token. Vercel names it BLOB_READ_WRITE_TOKEN, or <STORE_NAME>_READ_WRITE_TOKEN when the
 * store is connected with a custom prefix, so accept either.
 */
const blobToken =
  process.env.BLOB_READ_WRITE_TOKEN ||
  Object.entries(process.env).find(
    ([key, value]) => key.endsWith('_READ_WRITE_TOKEN') && value?.startsWith('vercel_blob_rw_'),
  )?.[1]

/** "Name <address>" → parts, for the admin's own emails (password resets). */
const [, fromName = 'Beauty of Bharat', fromAddress = 'noreply@thebeautyofbharat.com'] =
  /^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/.exec(process.env.CONTACT_FROM_EMAIL || '') ?? []

export default buildConfig({
  serverURL: getSiteUrl(),
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' — Beauty of Bharat',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/icon.svg' }],
    },
    components: {
      graphics: {
        Logo: '@/admin/Brand#Logo',
        Icon: '@/admin/Brand#Icon',
      },
    },
    livePreview: {
      breakpoints: [
        { label: 'Phone', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 820, height: 1180 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [
    Articles,
    People,
    Categories,
    Locations,
    Media,
    Pages,
    ContactSubmissions,
    ArticleViews,
    Users,
  ],
  globals: [SiteSettings, Navigation],
  editor: simpleEditor,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
    // Schema changes are pushed automatically in development; production runs committed migrations on boot.
    prodMigrations: migrations,
  }),
  // Without RESEND_API_KEY, Payload prints emails (e.g. password resets) to the server log.
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: fromAddress,
        defaultFromName: fromName,
      })
    : undefined,
  sharp,
  cors: [getSiteUrl()],
  csrf: [getSiteUrl()],
  graphQL: { disable: true },
  plugins: [
    redirectsPlugin({
      collections: ['articles', 'pages', 'people'],
      redirectTypes: ['301', '302'],
      overrides: {
        admin: { group: 'Settings' },
        access: {
          read: () => true,
          create: ({ req }) =>
            (req.user as { role?: string } | null)?.role !== 'reporter' && Boolean(req.user),
          update: ({ req }) =>
            (req.user as { role?: string } | null)?.role !== 'reporter' && Boolean(req.user),
          delete: ({ req }) =>
            (req.user as { role?: string } | null)?.role !== 'reporter' && Boolean(req.user),
        },
        hooks: { afterChange: [({ req, doc }) => (revalidate(req, EVERYTHING), doc)] },
      },
    }),
    // Photos go to Vercel Blob on Vercel (BLOB_READ_WRITE_TOKEN is set automatically when a Blob
    // store is connected); elsewhere they stay on local disk. `alwaysInsertFields` keeps the
    // database schema identical in both cases, so the committed migrations always match.
    vercelBlobStorage({
      enabled: Boolean(blobToken),
      token: blobToken,
      alwaysInsertFields: true,
      // Upload straight from the browser, so large photos aren't blocked by Vercel's 4.5 MB request limit.
      clientUploads: true,
      // Serve files directly from Blob's CDN instead of through the app.
      collections: { media: { disablePayloadAccessControl: true } },
    }),
  ],
  jobs: {
    // Scheduled publishing. On a long-running server jobs run every minute; on Vercel a cron
    // (vercel.json) calls /api/payload-jobs/run with CRON_SECRET instead.
    autoRun: isServerless ? undefined : [{ cron: '* * * * *', queue: 'default', limit: 20 }],
    access: {
      run: ({ req }: { req: PayloadRequest }) => {
        if (req.user) return true
        const secret = process.env.CRON_SECRET
        return Boolean(secret) && req.headers.get('authorization') === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
