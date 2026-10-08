import Link from 'next/link'

import { cn } from '@/lib/cn'

/** 2px ink rule, serif section title, optional "View all →" link. */
export function SectionHeader({
  title,
  href,
  linkLabel,
  mobileLinkLabel,
  as: Heading = 'h2',
  size = 'lg',
  className,
  aside,
}: {
  title: string
  href?: string
  linkLabel?: string
  mobileLinkLabel?: string
  as?: 'h1' | 'h2'
  size?: 'lg' | 'md'
  className?: string
  aside?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-baseline justify-between gap-3 border-t-2 border-ink pt-3.5 sm:gap-4 sm:pt-[18px]',
        className,
      )}
    >
      <Heading
        className={cn(
          'font-serif font-medium',
          size === 'lg' ? 'text-[26px] sm:text-[32px]' : 'text-[24px] sm:text-[28px]',
        )}
      >
        {title}
      </Heading>
      {href && linkLabel ? (
        <Link href={href} className="text-[13px] font-semibold text-green-text sm:text-sm">
          {mobileLinkLabel ? (
            <>
              <span className="sm:hidden">{mobileLinkLabel}</span>
              <span className="max-sm:hidden">{linkLabel}</span>
            </>
          ) : (
            linkLabel
          )}
        </Link>
      ) : (
        aside
      )}
    </div>
  )
}
