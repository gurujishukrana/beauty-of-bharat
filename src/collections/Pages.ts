import type { CollectionConfig } from 'payload'

import { loggedInOrPublished, staff } from '@/access'
import { pageBlocks } from '@/blocks/page'
import { isSampleField, slugField } from '@/fields'
import { revalidate } from '@/hooks/revalidate'
import { previewPath } from '@/lib/preview'

/** Pages with a fixed route on the site. Other slugs are stored but not linked. */
export const PAGE_SLUGS = ['about', 'privacy', 'terms'] as const

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Content',
    description: 'About, Privacy and Terms. The slug decides the address (about → /about).',
    livePreview: { url: ({ data }) => previewPath(`/${String(data?.slug ?? '')}`) },
    preview: (data) => previewPath(`/${String(data?.slug ?? '')}`),
  },
  access: { read: loggedInOrPublished, create: staff, update: staff, delete: staff },
  versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 20 },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [{ name: 'layout', type: 'blocks', blocks: pageBlocks, required: true }],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: false,
              fields: [
                { name: 'metaTitle', type: 'text' },
                { name: 'metaDescription', type: 'textarea' },
                { name: 'ogImage', type: 'upload', relationTo: 'media' },
                { name: 'noIndex', type: 'checkbox', label: 'Hide from search engines' },
              ],
            },
          ],
        },
      ],
    },
    slugField('title'),
    isSampleField,
  ],
  hooks: {
    afterChange: [
      ({ doc, req }) => {
        revalidate(req, [`/${doc.slug}`, '/sitemap.xml'])
        return doc
      },
    ],
  },
}
