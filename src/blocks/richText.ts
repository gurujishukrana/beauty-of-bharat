import type { Block } from 'payload'
import {
  BlocksFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'

import { parseVideoUrl, VIDEO_URL_HELP } from '@/lib/video'

export const ImageBlock: Block = {
  slug: 'imageBlock',
  interfaceName: 'ImageBlock',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    {
      type: 'row',
      fields: [
        { name: 'caption', type: 'text', admin: { width: '60%' } },
        {
          name: 'credit',
          type: 'text',
          admin: { width: '40%', placeholder: 'Photo: Name / Beauty of Bharat' },
        },
      ],
    },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'column',
      required: true,
      options: [
        { label: 'Column width (700px)', value: 'column' },
        { label: 'Wide (940px)', value: 'wide' },
      ],
    },
  ],
}

export const PullQuoteBlock: Block = {
  slug: 'pullQuote',
  interfaceName: 'PullQuoteBlock',
  labels: { singular: 'Pull quote', plural: 'Pull quotes' },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    {
      name: 'attribution',
      type: 'text',
      admin: { placeholder: 'The teacher, at her home in Ludhiana district' },
    },
  ],
}

export const VideoEmbedBlock: Block = {
  slug: 'videoEmbed',
  interfaceName: 'VideoEmbedBlock',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: { description: VIDEO_URL_HELP },
      validate: (value: unknown) =>
        (typeof value === 'string' && parseVideoUrl(value) !== null) || VIDEO_URL_HELP,
    },
    {
      type: 'row',
      fields: [
        { name: 'caption', type: 'text', admin: { width: '70%' } },
        { name: 'duration', type: 'text', admin: { width: '30%', placeholder: '3:12' } },
      ],
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional still shown before the video is played. Nothing loads from YouTube/Vimeo until a reader presses play.',
      },
    },
  ],
}

const linkFeature = LinkFeature({ enabledCollections: ['articles', 'people', 'pages'] })

/** Article body: paragraphs, H2/H3, bold/italic, links, lists and the three story blocks. */
export const articleEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
    BoldFeature(),
    ItalicFeature(),
    linkFeature,
    UnorderedListFeature(),
    OrderedListFeature(),
    BlocksFeature({ blocks: [ImageBlock, PullQuoteBlock, VideoEmbedBlock] }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})

/** Bios, About sections and legal pages. */
export const simpleEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
    BoldFeature(),
    ItalicFeature(),
    linkFeature,
    UnorderedListFeature(),
    OrderedListFeature(),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})
