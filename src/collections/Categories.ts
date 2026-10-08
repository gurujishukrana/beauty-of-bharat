import type { CollectionConfig } from 'payload'

import { anyone, staff } from '@/access'
import { isSampleField, slugField } from '@/fields'
import { EVERYTHING, revalidate } from '@/hooks/revalidate'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order', 'showInCategoryBar'],
    group: 'Content',
    description: 'Sections such as Education or Ground Reports. Lower "order" numbers appear first.',
  },
  defaultSort: 'order',
  access: { read: anyone, create: staff, update: staff, delete: staff },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    { name: 'description', type: 'textarea', admin: { description: 'Shown on the category page.' } },
    {
      type: 'row',
      fields: [
        { name: 'order', type: 'number', defaultValue: 100, admin: { width: '50%' } },
        {
          name: 'showInCategoryBar',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show in the category bar',
          admin: { width: '50%' },
        },
      ],
    },
    isSampleField,
  ],
  hooks: {
    afterChange: [({ req }) => revalidate(req, EVERYTHING)],
    afterDelete: [({ req }) => revalidate(req, EVERYTHING)],
  },
}
