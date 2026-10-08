import { MediaImage } from '@/components/MediaImage'
import { cn } from '@/lib/cn'
import type { ImageData } from '@/lib/media'

/** Image with caption and a fainter credit, e.g. "Photo: Harleen Kaur / Beauty of Bharat". */
export function Figure({
  image,
  caption,
  credit,
  wide,
  className,
}: {
  image: ImageData | null
  caption?: string | null
  credit?: string | null
  wide?: boolean
  className?: string
}) {
  const ratio = image ? `${image.width}/${image.height}` : '3/2'
  return (
    <figure className={cn('my-8 sm:my-10', wide && 'is-wide', className)}>
      <MediaImage
        image={image}
        aspect={ratio}
        sizes={wide ? '(max-width: 759px) 100vw, 940px' : '(max-width: 759px) 100vw, 700px'}
      />
      <FigCaption caption={caption ?? image?.caption} credit={credit ?? image?.credit} />
    </figure>
  )
}

export function FigCaption({
  caption,
  credit,
  className,
}: {
  caption?: string | null
  credit?: string | null
  className?: string
}) {
  if (!caption && !credit) return null
  return (
    <figcaption
      className={cn(
        'mt-2 font-sans text-xs leading-[1.45] text-subtle sm:mt-3 sm:text-[13px] sm:leading-normal',
        className,
      )}
    >
      {caption}
      {caption && credit ? ' ' : null}
      {credit ? <span className="text-faint">{credit}</span> : null}
    </figcaption>
  )
}
