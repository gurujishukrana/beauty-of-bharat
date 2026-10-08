import { cn } from '@/lib/cn'

type Variant = 'top' | 'short' | 'footer'

const sizes: Record<Variant, string> = {
  top: 'h-1 w-full',
  short: 'h-[3px] w-14 sm:w-[72px]',
  footer: 'h-[3px] w-[120px]',
}

/** Three equal segments of the brand colours. Footer variant swaps navy for white on the dark ground. */
export function TricolourRule({
  variant = 'top',
  className,
}: {
  variant?: Variant
  className?: string
}) {
  return (
    <div className={cn('flex', sizes[variant], className)} aria-hidden="true">
      <span className="flex-1 bg-saffron" />
      <span className={cn('flex-1', variant === 'footer' ? 'bg-white' : 'bg-navy')} />
      <span className="flex-1 bg-green" />
    </div>
  )
}
