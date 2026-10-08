import type { Block } from 'payload'

import { simpleEditor } from './richText'

/** Blocks for the `pages` collection. The About page is built from these. */

export const StatementHeroBlock: Block = {
  slug: 'statementHero',
  interfaceName: 'StatementHeroBlock',
  labels: { singular: 'Statement hero', plural: 'Statement heroes' },
  fields: [
    { name: 'kicker', type: 'text', defaultValue: 'About Beauty of Bharat' },
    { name: 'heading', type: 'textarea', required: true },
    {
      name: 'showMark',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show the Beauty of Bharat mark on the right',
    },
  ],
}

export const TwoColumnTextBlock: Block = {
  slug: 'twoColumnText',
  interfaceName: 'TwoColumnTextBlock',
  labels: { singular: 'Two-column text', plural: 'Two-column text' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'richText', editor: simpleEditor, required: true },
  ],
}

export const NumberedListBlock: Block = {
  slug: 'numberedList',
  interfaceName: 'NumberedListBlock',
  labels: { singular: 'Numbered list', plural: 'Numbered lists' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea' },
      ],
    },
  ],
}

export const CardGridBlock: Block = {
  slug: 'cardGrid',
  interfaceName: 'CardGridBlock',
  labels: { singular: 'Card grid', plural: 'Card grids' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    {
      name: 'background',
      type: 'select',
      defaultValue: 'sand',
      options: [
        { label: 'Sand', value: 'sand' },
        { label: 'White', value: 'white' },
      ],
    },
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea' },
      ],
    },
  ],
}

const linkFields = (name: string, label: string) => ({
  name,
  label,
  type: 'group' as const,
  fields: [
    {
      type: 'row' as const,
      fields: [
        { name: 'label', type: 'text' as const, admin: { width: '50%' } },
        {
          name: 'url',
          type: 'text' as const,
          admin: { width: '50%', placeholder: '/news' },
        },
      ],
    },
  ],
})

export const CtaRowBlock: Block = {
  slug: 'ctaRow',
  interfaceName: 'CtaRowBlock',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    linkFields('primary', 'Black button'),
    linkFields('secondary', 'Outline button'),
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  labels: { singular: 'Text', plural: 'Text' },
  fields: [{ name: 'content', type: 'richText', editor: simpleEditor, required: true }],
}

export const pageBlocks = [
  StatementHeroBlock,
  TwoColumnTextBlock,
  NumberedListBlock,
  CardGridBlock,
  CtaRowBlock,
  RichTextBlock,
]
