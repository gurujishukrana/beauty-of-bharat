import type { CollectionConfig } from 'payload'

import { articleAccess } from '@/access'
import { articleEditor } from '@/blocks/richText'
import { isSampleField, slugField } from '@/fields'
import { ARTICLE_TARGETS, revalidate } from '@/hooks/revalidate'
import { previewPath } from '@/lib/preview'
import { routes } from '@/lib/url'

import { scheduleEndpoint } from './endpoints/schedule'
import { guardAndDerive } from './hooks/guardAndDerive'
import { redirectOldSlug } from './hooks/redirectOldSlug'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      '_status',
      'primaryCategory',
      'authors',
      'publishedAt',
      'reviewStatus',
    ],
    listSearchableFields: ['title', 'deck'],
    group: 'Content',
    livePreview: { url: ({ data }) => previewPath(routes.article(String(data?.slug ?? ''))) },
    preview: (data) => previewPath(routes.article(String(data?.slug ?? ''))),
    pagination: { defaultLimit: 25 },
  },
  defaultSort: '-publishedAt',
  access: articleAccess,
  endpoints: [scheduleEndpoint],
  // What other documents get when they reference an article (e.g. related stories).
  defaultPopulate: {
    title: true,
    slug: true,
    deck: true,
    excerpt: true,
    heroImage: true,
    authors: true,
    primaryCategory: true,
    location: true,
    publishedAt: true,
    readTime: true,
    _status: true,
  },
  versions: {
    drafts: {
      autosave: { interval: 1500 },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Story',
          fields: [
            {
              name: 'deck',
              type: 'textarea',
              required: true,
              label: 'Standfirst (deck)',
              admin: { description: 'The one- or two-sentence summary under the headline.' },
            },
            {
              name: 'excerpt',
              type: 'textarea',
              maxLength: 200,
              admin: {
                description:
                  'Short text for story cards (200 characters max). Leave empty to use the standfirst.',
              },
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: { description: 'Required before publishing. Drafts can be saved without it.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'heroCaption',
                  type: 'text',
                  label: 'Hero caption',
                  admin: { width: '60%' },
                },
                {
                  name: 'heroCredit',
                  type: 'text',
                  label: 'Hero credit',
                  admin: { width: '40%', placeholder: 'Photo: Name / Beauty of Bharat' },
                },
              ],
            },
            { name: 'body', type: 'richText', editor: articleEditor, required: true },
          ],
        },
        {
          name: 'seo',
          label: 'SEO',
          fields: [
            {
              name: 'preview',
              type: 'ui',
              admin: { components: { Field: '@/admin/SeoPreview#SeoPreview' } },
            },
            {
              name: 'metaTitle',
              type: 'text',
              admin: { description: 'Up to 60 characters. Leave empty to use the headline.' },
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              admin: { description: 'Up to 160 characters. Leave empty to use the standfirst.' },
            },
            {
              name: 'ogImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Social sharing image',
              admin: { description: 'Leave empty to use the hero image.' },
            },
            {
              name: 'canonicalUrl',
              type: 'text',
              admin: { description: 'Only if this story was first published elsewhere.' },
            },
            {
              name: 'noIndex',
              type: 'checkbox',
              label: 'Hide from search engines, sitemaps and RSS',
            },
          ],
        },
      ],
    },
    slugField('title'),
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Publish date',
      index: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, h:mm a' },
        description:
          'Shown on the story and used for ordering. Filled in automatically on publish.',
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      relationTo: 'people',
      hasMany: true,
      required: true,
      minRows: 1,
      admin: { position: 'sidebar', description: 'The first person is the main byline.' },
    },
    {
      name: 'primaryCategory',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Extra categories',
      admin: { position: 'sidebar' },
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'locations',
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Feature on homepage',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'The newest featured story leads the homepage.' },
    },
    {
      name: 'updatedNote',
      type: 'checkbox',
      label: 'Show "Updated" date',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Tick after a meaningful change to a published story.',
      },
    },
    {
      name: 'relatedArticles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      maxRows: 3,
      admin: {
        position: 'sidebar',
        description: 'Up to 3. Leave empty to show other stories from the same category.',
      },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    {
      name: 'reviewStatus',
      type: 'select',
      defaultValue: 'in-progress',
      index: true,
      options: [
        { label: 'In progress', value: 'in-progress' },
        { label: 'Ready for review', value: 'ready' },
      ],
      admin: {
        position: 'sidebar',
        components: { Field: '@/admin/ReviewStatusField#ReviewStatusField' },
      },
    },
    {
      name: 'readTime',
      type: 'number',
      label: 'Read time (minutes)',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Calculated from the story text.',
      },
    },
    {
      name: 'plainText',
      type: 'textarea',
      admin: { hidden: true },
    },
    isSampleField,
  ],
  hooks: {
    beforeChange: [guardAndDerive],
    afterChange: [
      redirectOldSlug,
      ({ doc, previousDoc, req }) => {
        if (doc._status === 'published' || previousDoc?._status === 'published') {
          revalidate(req, ARTICLE_TARGETS)
        }
        return doc
      },
    ],
    afterDelete: [({ req }) => revalidate(req, ARTICLE_TARGETS)],
  },
}
