import type { CollectionConfig } from 'payload'

import { anyone, staff } from '@/access'
import { isSampleField, slugField } from '@/fields'
import { EVERYTHING, revalidate } from '@/hooks/revalidate'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'state', 'slug'],
    group: 'Content',
    description:
      'Places stories come from and reporters are based in. Shown as "Ludhiana, Punjab".',
  },
  defaultSort: 'name',
  access: { read: anyone, create: staff, update: staff, delete: staff },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { width: '50%', placeholder: 'Ludhiana' },
        },
        { name: 'state', type: 'text', admin: { width: '50%', placeholder: 'Punjab' } },
      ],
    },
    {
      name: 'displayName',
      type: 'text',
      admin: { readOnly: true, hidden: true },
      hooks: {
        beforeChange: [
          ({ siblingData }) =>
            [siblingData.name, siblingData.state].filter(Boolean).join(', ') || undefined,
        ],
      },
    },
    slugField('name'),
    isSampleField,
  ],
  hooks: {
    afterChange: [({ req }) => revalidate(req, EVERYTHING)],
  },
}
