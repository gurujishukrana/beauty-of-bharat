import type { Field, TextField } from 'payload'

import { slugify } from '@/lib/text'

/**
 * Unique, URL-safe slug generated from `from` when left empty. Editors can change it;
 * whatever they type is cleaned to lowercase-hyphenated form.
 */
export function slugField(from: string, overrides: Partial<TextField> = {}): TextField {
  return {
    name: 'slug',
    type: 'text',
    index: true,
    unique: true,
    required: true,
    admin: {
      position: 'sidebar',
      description: 'Used in the web address. Leave empty to generate it from the title.',
      ...overrides.admin,
    },
    hooks: {
      beforeValidate: [
        ({ value, data, originalDoc }) => {
          if (typeof value === 'string' && value.trim()) return slugify(value)
          const source = (data?.[from] ?? originalDoc?.[from]) as unknown
          return typeof source === 'string' && source.trim() ? slugify(source) : value
        },
      ],
    },
    ...overrides,
  } as TextField
}

/** Marks documents created by `pnpm seed` so `pnpm seed:clear` can delete exactly those. */
export const isSampleField: Field = {
  name: 'isSample',
  type: 'checkbox',
  defaultValue: false,
  label: 'Sample content',
  admin: {
    position: 'sidebar',
    readOnly: true,
    description: 'Created by the seed script. Run `pnpm seed:clear` to remove all sample content.',
    condition: (data) => Boolean(data?.isSample),
  },
}

export const SOCIAL_PLATFORMS = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'X / Twitter', value: 'x' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Website', value: 'website' },
  { label: 'Email', value: 'email' },
] as const

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]['value']

export function socialLinksField(platforms: readonly SocialPlatform[]): Field {
  return {
    name: 'socialLinks',
    type: 'array',
    labels: { singular: 'Link', plural: 'Links' },
    admin: { initCollapsed: true },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'platform',
            type: 'select',
            required: true,
            options: SOCIAL_PLATFORMS.filter((p) => platforms.includes(p.value)).map((p) => ({
              ...p,
            })),
            admin: { width: '35%' },
          },
          {
            name: 'url',
            type: 'text',
            required: true,
            label: 'Link or email address',
            admin: { width: '65%' },
            validate: (value: unknown) => {
              if (typeof value !== 'string' || !value.trim()) return 'Required'
              const v = value.trim()
              if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return true
              return /^https?:\/\/\S+$/.test(v) || 'Use a full link starting with https://'
            },
          },
        ],
      },
    ],
  }
}
