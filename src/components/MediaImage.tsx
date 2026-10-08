import Image from 'next/image'

import { CameraIcon } from '@/components/Icons'
import { cn } from '@/lib/cn'
import type { ImageData } from '@/lib/media'

type Props = {
  image: ImageData | null
  /** CSS aspect-ratio of the frame, e.g. "16/10". The image is cropped to fill it. */
  aspect: string
  sizes: string
  priority?: boolean
  className?: string
  /** Shown inside the placeholder when there is no image. */
  placeholderLabel?: string
  rounded?: boolean
}

/**
 * Fixed-ratio image frame. The frame reserves its space (no layout shift) and shows the
 * `placeholder` colour while loading, or permanently when an article has no image yet.
 */
export function MediaImage({
  image,
  aspect,
  sizes,
  priority,
  className,
  placeholderLabel,
  rounded = true,
}: Props) {
  return (
    <div
      className={cn('relative overflow-hidden bg-placeholder', rounded && 'rounded-xs', className)}
      style={{ aspectRatio: aspect }}
    >
      {image ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          fetchPriority={priority ? 'high' : undefined}
          className="object-cover"
          style={{ objectPosition: image.position }}
        />
      ) : (
        <ImagePlaceholder label={placeholderLabel} />
      )}
    </div>
  )
}

/** The `placeholder` colour block used when there is no image. */
export function ImagePlaceholder({ label }: { label?: string }) {
  return (
    <div className="absolute inset-0 flex items-end p-3 sm:p-4" aria-hidden="true">
      {label ? (
        <span className="flex items-center gap-1.5 text-[11px] text-placeholder-text sm:text-xs">
          <CameraIcon />
          {label}
        </span>
      ) : null}
    </div>
  )
}
