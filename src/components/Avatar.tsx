import Image from 'next/image'

import { cn } from '@/lib/cn'
import type { ImageData } from '@/lib/media'
import { initials } from '@/lib/text'

/** Soft tones from the design files, picked deterministically per name for initials avatars. */
const TONES = ['#E7E1D5', '#DDE3DC', '#E1E0E8', '#E9DFD3', '#DCE2E4', '#E4E2D6', '#E3DED2', '#D9E1DF']

export function toneFor(name: string): string {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return TONES[hash % TONES.length]
}

type Props = {
  name: string
  image: ImageData | null
  /** Pixel size for round avatars; omit with `shape="portrait"` to fill the parent width. */
  size?: number
  shape?: 'round' | 'portrait'
  sizes?: string
  priority?: boolean
  className?: string
  initialsClassName?: string
}

/** Person photo, or their initials on a soft tone when there is no photo yet. */
export function Avatar({ name, image, size, shape = 'round', sizes, priority, className, initialsClassName }: Props) {
  const round = shape === 'round'
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden font-serif',
        round ? 'rounded-full text-body' : 'rounded-xs text-[#6A6458]',
        className,
      )}
      style={{
        background: image ? undefined : toneFor(name),
        width: size,
        height: size,
        aspectRatio: round ? '1' : '4/5',
      }}
    >
      {image ? (
        <Image
          src={image.url}
          alt={round ? '' : image.alt || name}
          fill
          sizes={sizes ?? (size ? `${size}px` : '400px')}
          priority={priority}
          className="object-cover"
          style={{ objectPosition: image.position }}
        />
      ) : (
        <span aria-hidden="true" className={initialsClassName} style={size ? { fontSize: Math.round(size * 0.38) } : undefined}>
          {initials(name)}
        </span>
      )}
    </div>
  )
}
