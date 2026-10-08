import type { CollectionConfig } from 'payload'

import { hasRole, publicPeopleWhere, staff } from '@/access'
import { simpleEditor } from '@/blocks/richText'
import { isSampleField, slugField, socialLinksField } from '@/fields'
import { PEOPLE_TARGETS, revalidate } from '@/hooks/revalidate'
import { previewPath } from '@/lib/preview'
import { routes } from '@/lib/url'

export const ROLE_TYPES = [
  { label: 'Editor', value: 'editor', plural: 'Editors' },
  { label: 'Reporter', value: 'reporter', plural: 'Reporters' },
  { label: 'Photographer', value: 'photographer', plural: 'Photographers' },
  { label: 'Contributor', value: 'contributor', plural: 'Contributors' },
] as const

export const People: CollectionConfig = {
  slug: 'people',
  labels: { singular: 'Person', plural: 'People' },
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'designation', 'pressCardNumber', 'pressCardStatus', '_status'],
    group: 'Content',
    description:
      'Public team profiles. A profile is visible only when it is published, its press card is active and "Show on People page" is ticked.',
    livePreview: { url: ({ data }) => previewPath(routes.person(String(data?.slug ?? ''))) },
    preview: (data) => previewPath(routes.person(String(data?.slug ?? ''))),
  },
  defaultSort: 'order',
  access: {
    read: ({ req }) => (req.user ? true : publicPeopleWhere),
    create: staff,
    update: staff,
    delete: ({ req }) => hasRole(req.user, 'admin'),
  },
  versions: { drafts: true, maxPerDoc: 20 },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profile',
          fields: [
            { name: 'fullName', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'designation',
                  type: 'text',
                  required: true,
                  admin: { width: '50%', placeholder: 'Punjab Correspondent' },
                },
                {
                  name: 'roleType',
                  type: 'select',
                  required: true,
                  defaultValue: 'reporter',
                  options: ROLE_TYPES.map(({ label, value }) => ({ label, value })),
                  admin: { width: '50%', description: 'Used for the People page filters.' },
                },
              ],
            },
            { name: 'location', type: 'relationship', relationTo: 'locations' },
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'A real photo of this person, shown in a 4:5 portrait crop. Set the focal point on their face.',
              },
            },
            {
              name: 'shortBio',
              type: 'textarea',
              required: true,
              maxLength: 240,
              admin: { description: 'One or two sentences for the People page card (240 characters max).' },
            },
            {
              name: 'bio',
              type: 'richText',
              editor: simpleEditor,
              admin: { description: 'Longer bio for the profile page. Falls back to the short bio.' },
            },
            socialLinksField(['instagram', 'x', 'youtube', 'linkedin', 'facebook', 'website', 'email']),
          ],
        },
        {
          label: 'Press card',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'pressCardNumber',
                  type: 'text',
                  required: true,
                  unique: true,
                  index: true,
                  admin: { width: '33%', placeholder: 'BOB/004' },
                },
                {
                  name: 'pressCardStatus',
                  type: 'select',
                  required: true,
                  defaultValue: 'active',
                  options: [
                    { label: 'Active', value: 'active' },
                    { label: 'Suspended', value: 'suspended' },
                    { label: 'Revoked', value: 'revoked' },
                  ],
                  admin: {
                    width: '33%',
                    description: 'Suspended or revoked cards remove the profile from the site.',
                  },
                },
                { name: 'dateJoined', type: 'date', admin: { width: '33%', date: { pickerAppearance: 'monthOnly', displayFormat: 'MMMM yyyy' } } },
              ],
            },
          ],
        },
        {
          label: 'Articles',
          fields: [
            {
              name: 'articles',
              type: 'join',
              collection: 'articles',
              on: 'authors',
              admin: { defaultColumns: ['title', '_status', 'publishedAt'] },
            },
          ],
        },
      ],
    },
    slugField('fullName'),
    {
      name: 'showOnPeoplePage',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show on People page',
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Lower numbers are listed first, then by name.' },
    },
    isSampleField,
  ],
  hooks: {
    afterChange: [({ req }) => revalidate(req, PEOPLE_TARGETS)],
    afterDelete: [({ req }) => revalidate(req, PEOPLE_TARGETS)],
  },
}
