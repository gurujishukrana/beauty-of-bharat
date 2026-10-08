import type { Media } from '@/payload-types'

import { getSiteUrl } from './url'

export type ImageSize = 'thumb' | 'card' | 'feature' | 'hero' | 'portrait' | 'og'

/** Serializable image data passed to components (server → client safe). */
export type ImageData = {
  url: string
  width: number
  height: number
  alt: string
  caption?: string | null
  credit?: string | null
  /** CSS object-position from the editor's focal point, e.g. "50% 30%". */
  position: string
}

export function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value && 'alt' in value
}

/**
 * Picks a generated size (falling back to the original) and returns plain image data.
 * Returns null for missing or unpopulated uploads so callers can render a placeholder.
 */
export function toImage(value: unknown, size?: ImageSize): ImageData | null {
  if (!isMedia(value) || !value.url) return null
  const variant = size ? value.sizes?.[size] : undefined
  const url = toRelative(variant?.url || value.url)
  const width = (variant?.url && variant.width) || value.width || 1600
  const height = (variant?.url && variant.height) || value.height || 1000
  return {
    url,
    width,
    height,
    alt: value.alt || '',
    caption: value.caption,
    credit: value.credit,
    position: `${value.focalX ?? 50}% ${value.focalY ?? 50}%`,
  }
}

/** Payload returns absolute URLs for local files; next/image wants them relative. */
function toRelative(url: string): string {
  const site = getSiteUrl()
  return url.startsWith(site) ? url.slice(site.length) || '/' : url
}
