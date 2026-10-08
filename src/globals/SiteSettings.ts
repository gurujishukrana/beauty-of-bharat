import type { GlobalConfig } from 'payload'

import { adminOnly, anyone } from '@/access'
import { socialLinksField } from '@/fields'
import { EVERYTHING, revalidate } from '@/hooks/revalidate'

const email = (name: string, label: string, defaultValue: string, description: string) => ({
  type: 'row' as const,
  fields: [
    {
      name,
      type: 'email' as const,
      label,
      defaultValue,
      required: true,
      admin: { width: '40%' },
    },
    {
      name: `${name}Text`,
      type: 'text' as const,
      label: `${label} — description`,
      defaultValue: description,
      admin: { width: '60%' },
    },
  ],
})

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  label: 'Site settings',
  admin: { group: 'Settings' },
  access: { read: anyone, update: adminOnly },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'tagline',
              type: 'text',
              required: true,
              defaultValue:
                'A free newspaper telling uplifting stories about India from ground zero.',
              admin: { description: 'Footer, search results and social sharing.' },
            },
            {
              name: 'missionLine',
              type: 'textarea',
              required: true,
              defaultValue:
                'A free newspaper telling *uplifting stories about India from ground zero* — the people, places and progress that deserve to be seen.',
              admin: {
                description:
                  'The line at the top of the homepage. Wrap words in *asterisks* to italicise them.',
              },
            },
            {
              name: 'utilityBarText',
              type: 'text',
              required: true,
              defaultValue: 'A free newspaper. No paywall, ever.',
            },
            socialLinksField(['instagram', 'youtube', 'whatsapp', 'x', 'facebook', 'linkedin']),
            {
              type: 'row',
              fields: [
                {
                  name: 'defaultOgImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Default sharing image',
                  admin: {
                    width: '50%',
                    description: '1200×630. Used when a page has no image of its own.',
                  },
                },
                {
                  name: 'organizationLogo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { width: '50%', description: 'Optional. Defaults to the colour logo.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'contactIntro',
              type: 'textarea',
              defaultValue:
                'Have a story, a question or a correction? Choose the right desk below and we will get back to you.',
            },
            {
              name: 'contactEmails',
              type: 'group',
              label: 'Desks',
              admin: {
                description: 'PLACEHOLDERS — confirm these addresses exist before launch.',
              },
              fields: [
                email(
                  'tips',
                  'News tips',
                  'tips@thebeautyofbharat.com',
                  'Know someone or something that deserves to be seen? Tell us the story.',
                ),
                email(
                  'press',
                  'Press enquiries',
                  'press@thebeautyofbharat.com',
                  'For media, partnerships and interview requests.',
                ),
                email(
                  'general',
                  'General enquiries',
                  'hello@thebeautyofbharat.com',
                  'Anything else you would like to ask or share with us.',
                ),
                email(
                  'corrections',
                  'Corrections',
                  'corrections@thebeautyofbharat.com',
                  'Report a factual error. Please include the story link.',
                ),
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'whatsappNumber',
                  type: 'text',
                  defaultValue: '[WhatsApp number]',
                  admin: {
                    width: '50%',
                    description: 'PLACEHOLDER. Include the country code, e.g. +91 98765 43210.',
                  },
                },
                {
                  name: 'whatsappChannelUrl',
                  type: 'text',
                  admin: { width: '50%', placeholder: 'https://whatsapp.com/channel/…' },
                },
              ],
            },
          ],
        },
        {
          label: 'Homepage',
          fields: [
            {
              name: 'homepage',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'latestCount',
                  type: 'number',
                  defaultValue: 6,
                  min: 3,
                  max: 24,
                  label: 'Stories in "Latest news"',
                },
                {
                  name: 'groundReportsCategory',
                  type: 'relationship',
                  relationTo: 'categories',
                  label: '"Ground reports" section shows this category',
                },
                {
                  name: 'mostReadMode',
                  type: 'radio',
                  defaultValue: 'pinned',
                  label: '"Most read" list',
                  options: [
                    {
                      label: 'Stories picked below (newest stories fill any gaps)',
                      value: 'pinned',
                    },
                    {
                      label: 'Count views (private: no cookies, one counter per story per day)',
                      value: 'views',
                    },
                  ],
                },
                {
                  name: 'mostReadPinned',
                  type: 'relationship',
                  relationTo: 'articles',
                  hasMany: true,
                  maxRows: 5,
                  label: 'Most read: pinned stories',
                  admin: { condition: (_, sibling) => sibling?.mostReadMode !== 'views' },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'showPeopleBand',
                      type: 'checkbox',
                      defaultValue: true,
                      label: 'Show the people band',
                    },
                    {
                      name: 'showTipBand',
                      type: 'checkbox',
                      defaultValue: true,
                      label: 'Show the news tip band',
                    },
                  ],
                },
                {
                  name: 'peopleBandPeople',
                  type: 'relationship',
                  relationTo: 'people',
                  hasMany: true,
                  maxRows: 5,
                  label: 'People band: who to show',
                  admin: { description: 'Leave empty to show the first five by People order.' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [({ req, doc }) => (revalidate(req, EVERYTHING), doc)],
  },
}
