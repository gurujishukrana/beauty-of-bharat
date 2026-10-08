import type { CollectionConfig } from 'payload'

import { adminOnly, nobody, staff } from '@/access'

export const CONTACT_TOPICS = [
  { label: 'News tip', value: 'news-tip' },
  { label: 'Press enquiry', value: 'press' },
  { label: 'General enquiry', value: 'general' },
  { label: 'Correction', value: 'correction' },
] as const

export type ContactTopic = (typeof CONTACT_TOPICS)[number]['value']

export const ContactSubmissions: CollectionConfig = {
  slug: 'contactSubmissions',
  labels: { singular: 'Contact message', plural: 'Contact messages' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'topic', 'status', 'contact', 'createdAt'],
    group: 'Inbox',
    description: 'Messages sent through the Contact page. Each one is also emailed to the matching desk.',
  },
  defaultSort: '-createdAt',
  // Created only by the contact form's server action (which bypasses access control).
  access: { create: nobody, read: staff, update: staff, delete: adminOnly },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%', readOnly: true } },
        {
          name: 'contact',
          type: 'text',
          required: true,
          label: 'Email or phone',
          admin: { width: '50%', readOnly: true },
        },
      ],
    },
    {
      name: 'topic',
      type: 'select',
      required: true,
      options: CONTACT_TOPICS.map((t) => ({ ...t })),
      admin: { readOnly: true },
    },
    { name: 'articleUrl', type: 'text', label: 'Article link', admin: { readOnly: true } },
    { name: 'message', type: 'textarea', required: true, admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      required: true,
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'In progress', value: 'in-progress' },
        { label: 'Done', value: 'done' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'emailed',
      type: 'checkbox',
      label: 'Emailed to desk',
      admin: { position: 'sidebar', readOnly: true },
    },
    // Salted hash of the sender's IP, used only to rate-limit the form. Never shown.
    { name: 'ipHash', type: 'text', index: true, admin: { hidden: true } },
  ],
  timestamps: true,
}
