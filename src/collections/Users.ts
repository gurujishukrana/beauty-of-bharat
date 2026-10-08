import type { CollectionConfig } from 'payload'

import { adminOnly, adminOnlyField, hasRole } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'CMS user', plural: 'CMS users' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'person'],
    group: 'Settings',
    description: 'Logins for the editorial team. Public team profiles live under People.',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 60 * 60 * 8,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    create: adminOnly,
    delete: adminOnly,
    read: ({ req }) => {
      if (hasRole(req.user, 'admin')) return true
      return req.user ? { id: { equals: req.user.id } } : false
    },
    update: ({ req }) => {
      if (hasRole(req.user, 'admin')) return true
      return req.user ? { id: { equals: req.user.id } } : false
    },
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'reporter',
      saveToJWT: true,
      options: [
        { label: 'Admin — everything, including users and settings', value: 'admin' },
        { label: 'Editor — publish, schedule and manage all content', value: 'editor' },
        { label: 'Reporter — write own drafts, cannot publish', value: 'reporter' },
      ],
      access: { create: adminOnlyField, update: adminOnlyField },
      // Hidden on the first-account screen: that account always becomes an admin.
      admin: { position: 'sidebar', condition: (_data, _sibling, { user }) => Boolean(user) },
    },
    {
      name: 'person',
      type: 'relationship',
      relationTo: 'people',
      saveToJWT: true,
      label: 'Public profile',
      admin: {
        position: 'sidebar',
        condition: (_data, _sibling, { user }) => Boolean(user),
        description:
          'Link this login to a People profile. Reporters can only edit drafts where this profile is an author.',
      },
      access: { create: adminOnlyField, update: adminOnlyField },
    },
  ],
  hooks: {
    beforeChange: [
      // The very first account (created on the /admin welcome screen) is always an admin.
      async ({ operation, data, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', req })
          if (totalDocs === 0) return { ...data, role: 'admin' }
        }
        return data
      },
    ],
  },
  timestamps: true,
}
