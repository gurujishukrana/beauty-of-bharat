import type { CollectionConfig } from 'payload'

import { adminOnly, nobody, staff } from '@/access'

/**
 * Optional, privacy-friendly view counter for "Most read": one row per article per day,
 * incremented server-side. No cookies, no IPs, no user agents. Off unless enabled in Site settings.
 */
export const ArticleViews: CollectionConfig = {
  slug: 'articleViews',
  labels: { singular: 'Daily views', plural: 'Daily views' },
  admin: {
    group: 'Inbox',
    defaultColumns: ['article', 'day', 'count'],
    hidden: ({ user }) => (user as { role?: string } | null)?.role !== 'admin',
  },
  access: { create: nobody, read: staff, update: nobody, delete: adminOnly },
  indexes: [{ fields: ['article', 'day'], unique: true }],
  fields: [
    { name: 'article', type: 'relationship', relationTo: 'articles', required: true, index: true },
    {
      name: 'day',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'YYYY-MM-DD (IST)' },
    },
    { name: 'count', type: 'number', defaultValue: 0, required: true },
  ],
  timestamps: false,
}
