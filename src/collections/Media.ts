import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

import { anyone, loggedIn, staff } from '@/access'
import { isSampleField } from '@/fields'
import { EVERYTHING, revalidate } from '@/hooks/revalidate'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image', plural: 'Media library' },
  admin: {
    group: 'Content',
    defaultColumns: ['filename', 'alt', 'credit', 'updatedAt'],
    description:
      'Every image needs alt text describing it for readers who cannot see it. Set the focal point so crops keep the subject in frame.',
  },
  access: {
    read: anyone,
    create: loggedIn,
    update: loggedIn,
    delete: staff,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt text',
      admin: {
        description:
          'Describe what the image shows, e.g. "Children doing homework in a courtyard at dusk".',
      },
    },
    { name: 'caption', type: 'text' },
    {
      name: 'credit',
      type: 'text',
      admin: { placeholder: 'Photo: Harleen Kaur / Beauty of Bharat' },
    },
    isSampleField,
  ],
  upload: {
    // Local disk in development. In production the S3/R2 adapter (payload.config.ts) takes over.
    staticDir: process.env.MEDIA_DIR || path.resolve(dirname, '../../media'),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
    focalPoint: true,
    crop: true,
    adminThumbnail: 'thumb',
    imageSizes: [
      { name: 'thumb', width: 400, withoutEnlargement: true },
      // 16:10, the card ratio. Cropped around the focal point.
      { name: 'card', width: 800, height: 500, position: 'centre', withoutEnlargement: true },
      { name: 'feature', width: 1600, withoutEnlargement: true },
      { name: 'hero', width: 2400, withoutEnlargement: true },
      // 4:5 portrait for People.
      { name: 'portrait', width: 800, height: 1000, position: 'centre', withoutEnlargement: true },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
  },
  hooks: {
    afterChange: [
      ({ req, operation }) => {
        if (operation === 'update') revalidate(req, EVERYTHING)
      },
    ],
  },
}
