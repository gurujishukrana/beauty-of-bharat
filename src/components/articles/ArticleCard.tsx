import Link from 'next/link'

import { MediaImage } from '@/components/MediaImage'
import { kicker, type CardData } from '@/lib/cards'
import { cn } from '@/lib/cn'

type Props = {
  card: CardData
  /**
   * grid: the standard card (16:10 image, kicker, headline, excerpt, byline).
   * related: same without the excerpt.
   * On phones, `compactOnMobile` turns either into a compact row (text left, square thumb right).
   */
  variant?: 'grid' | 'related'
  compactOnMobile?: boolean
  headingLevel?: 'h2' | 'h3'
}

/** Story card used in grids. Server and client safe (also rendered by "Load more"). */
export function ArticleCard({ card, variant = 'grid', compactOnMobile, headingLevel = 'h3' }: Props) {
  const Heading = headingLevel
  const compact = compactOnMobile
  return (
    <article className={cn(compact && 'max-sm:border-b max-sm:border-rule')}>
      <Link
        href={card.href}
        className={cn(
          'group flex flex-col gap-3',
          compact && 'max-sm:flex-row-reverse max-sm:items-start max-sm:gap-3.5 max-sm:py-4',
        )}
      >
        <MediaImage
          image={card.image}
          aspect="16/10"
          sizes={compact ? '(max-width: 759px) 96px, (max-width: 1100px) 50vw, 400px' : '(max-width: 759px) 100vw, (max-width: 1100px) 50vw, 400px'}
          placeholderLabel={variant === 'grid' && card.place ? `Photo · ${card.place}` : undefined}
          className={cn(compact && 'max-sm:aspect-square! max-sm:w-24 max-sm:shrink-0')}
        />
        <div className={cn('flex flex-col gap-3', compact && 'max-sm:min-w-0 max-sm:flex-1 max-sm:gap-1.5')}>
          <p className={cn('kicker', compact && 'max-sm:text-[10px]')}>
            {kicker(card.category, card.place)}
          </p>
          <Heading
            className={cn(
              'font-serif font-medium text-ink group-hover:text-green',
              variant === 'grid' ? 'text-[22px] leading-[1.2] sm:text-[23px]' : 'text-[22px] leading-[1.22]',
              compact && 'max-sm:text-[18px] max-sm:leading-[1.25]',
            )}
          >
            {card.title}
          </Heading>
          {variant === 'grid' && card.excerpt ? (
            <p className={cn('text-[15px] leading-[1.55] text-muted', compact && 'max-sm:hidden')}>
              {card.excerpt}
            </p>
          ) : null}
          <p className={cn('text-[13px] text-subtle', compact && 'max-sm:text-xs')}>
            {variant === 'grid' && card.authors ? (
              <>
                <span className="font-semibold text-ink">{card.authors}</span> ·{' '}
              </>
            ) : card.authors ? (
              `${card.authors} · `
            ) : null}
            <time dateTime={card.dateISO}>{card.date}</time>
          </p>
        </div>
      </Link>
    </article>
  )
}
