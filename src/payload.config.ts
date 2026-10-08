import path from 'path'
import { fileURLToPath } from 'url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { s3Storage } from '@payloadcms/storage-s3'
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

const useS3 = Boolean(process.env.S3_BUCKET)
const isServerless = Boolean(process.env.VERCEL)

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
    s3Storage({
      enabled: useS3,
      collections: {
        media: {
          // Files are served straight from the bucket's public URL (CDN), not through Payload.
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            `${process.env.S3_PUBLIC_URL}/${[prefix, filename].filter(Boolean).join('/')}`,
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'auto',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
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
