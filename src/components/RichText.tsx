import type {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedEditorState,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'

import { Figure } from '@/components/article/Figure'
import { PullQuote } from '@/components/article/PullQuote'
import { VideoEmbed } from '@/components/article/VideoEmbed'
import { toImage } from '@/lib/media'
import { routes } from '@/lib/url'
import { parseVideoUrl } from '@/lib/video'
import type { ImageBlock, PullQuoteBlock, VideoEmbedBlock } from '@/payload-types'

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<ImageBlock | PullQuoteBlock | VideoEmbedBlock>

/** Internal links point at documents; turn them into site URLs. */
function internalDocToHref({ linkNode }: { linkNode: SerializedLinkNode }): string {
  const doc = linkNode.fields.doc
  if (!doc) return '/'
  const value = doc.value as { slug?: string } | number | string
  const slug = typeof value === 'object' && value ? value.slug : undefined
  if (!slug) return '/'
  switch (doc.relationTo) {
    case 'articles':
      return routes.article(slug)
    case 'people':
      return routes.person(slug)
    default:
      return `/${slug}`
  }
}

const converters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  blocks: {
    imageBlock: ({ node }) => (
      <Figure
        image={toImage(node.fields.image, node.fields.size === 'wide' ? 'hero' : 'feature')}
        caption={node.fields.caption}
        credit={node.fields.credit}
        wide={node.fields.size === 'wide'}
      />
    ),
    pullQuote: ({ node }) => <PullQuote quote={node.fields.quote} attribution={node.fields.attribution} />,
    videoEmbed: ({ node }) => {
      const video = parseVideoUrl(node.fields.url)
      if (!video) return null
      return (
        <VideoEmbed
          video={video}
          poster={toImage(node.fields.poster, 'feature')}
          title={node.fields.caption || 'Video'}
          duration={node.fields.duration}
          caption={node.fields.caption}
        />
      )
    },
  },
})

/**
 * Renders Lexical content as React elements (never raw HTML). Video URLs are re-validated
 * against the allowlist at render time.
 */
export function RichText({
  data,
  className,
}: {
  data: SerializedEditorState | null | undefined
  className?: string
}) {
  if (!data) return null
  return <LexicalRichText data={data} converters={converters} className={className} disableContainer={false} />
}
