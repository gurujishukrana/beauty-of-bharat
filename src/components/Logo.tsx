/* eslint-disable @next/next/no-img-element -- static SVG logo; next/image adds nothing here */
import { cn } from '@/lib/cn'

// Intrinsic aspect ratio of brand/logo-*.svg (viewBox 808 × 108).
const RATIO = 808 / 108

type Props = {
  tone?: 'color' | 'white' | 'black'
  /** Largest rendered height in px (sets the intrinsic size). Header: 34 desktop / 22 mobile. Footer: 28–30. */
  height: number
  /** Responsive height classes, e.g. "h-[22px] sm:h-[34px]". */
  className?: string
  alt?: string
}

export function Logo({ tone = 'color', height, className, alt = 'Beauty of Bharat' }: Props) {
  return (
    <img
      src={`/brand/logo-${tone}.svg`}
      alt={alt}
      width={Math.round(height * RATIO)}
      height={height}
      className={cn('block w-auto max-w-full', className)}
    />
  )
}

export function Mark({
  size,
  tone = 'color',
  className,
}: {
  size: number
  tone?: 'color' | 'white' | 'black'
  className?: string
}) {
  return (
    <img
      src={`/brand/mark-${tone}.svg`}
      alt=""
      width={size}
      height={size}
      className={cn('block', className)}
      style={{ width: size, height: size }}
    />
  )
}
