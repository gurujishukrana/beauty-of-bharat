import type { Field, GlobalConfig } from 'payload'

import { adminOnly, anyone } from '@/access'
import { EVERYTHING, revalidate } from '@/hooks/revalidate'

const links = (
  name: string,
  label: string,
  defaultValue: { label: string; url: string }[],
): Field => ({
  name,
  label,
  type: 'array',
  defaultValue,
  admin: { initCollapsed: true },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', required: true, admin: { width: '50%' } },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: { width: '50%', placeholder: '/news or https://…' },
        },
      ],
    },
  ],
})

export const DEFAULT_HEADER_LINKS = [
  { label: 'Home', url: '/' },
  { label: 'News', url: '/news' },
  { label: 'People', url: '/people' },
  { label: 'About', url: '/about' },
  { label: 'Contact', url: '/contact' },
]

export const DEFAULT_LEGAL_LINKS = [
  { label: 'Privacy Policy', url: '/privacy' },
  { label: 'Terms of Use', url: '/terms' },
  { label: 'Corrections', url: '/contact?topic=correction' },
]

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  admin: {
    group: 'Settings',
    description: 'Header and footer links. The "Follow" column uses Site settings → social links.',
  },
  access: { read: anyone, update: adminOnly },
  fields: [
    links('header', 'Main navigation', DEFAULT_HEADER_LINKS),
    links('footerSections', 'Footer — Sections', DEFAULT_HEADER_LINKS),
    links('footerLegal', 'Footer — Legal', DEFAULT_LEGAL_LINKS),
  ],
  hooks: {
    afterChange: [({ req, doc }) => (revalidate(req, EVERYTHING), doc)],
  },
}
