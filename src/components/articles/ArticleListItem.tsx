import Link from 'next/link'

import { MediaImage } from '@/components/MediaImage'
import { kicker, type CardData } from '@/lib/cards'
import { cn } from '@/lib/cn'

/**
 * Thumbnail-left row (Ground reports, profile article lists). On phones it becomes the
 * compact layout from MobileHome.html: text left, square thumbnail right.
 */
export function ArticleListItem({
  card,
  showAuthor = true,
  thumbWidth = 168,
  label,
}: {
  card: CardData
  showAuthor?: boolean
  thumbWidth?: 156 | 168
  /** Overrides the kicker text. */
  label?: string
}) {
  return (
    <article className="border-b border-rule">
      <Link
        href={card.href}
        className="group flex flex-row-reverse items-start gap-3.5 py-4 sm:flex-row sm:gap-5 sm:py-[22px]"
      >
        <MediaImage
          image={card.image}
          aspect="4/3"
          sizes="(max-width: 759px) 96px, 168px"
          className={cn(
            'w-24 shrink-0 max-sm:aspect-square!',
            thumbWidth === 168 ? 'sm:w-[168px]' : 'sm:w-[156px]',
          )}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2">
          <p className="kicker max-sm:text-[10px]">{label ?? kicker(card.category, card.place)}</p>
          <h3 className="font-serif text-[18px] leading-[1.25] font-medium text-ink group-hover:text-green sm:text-[22px] sm:leading-[1.22]">
            {card.title}
          </h3>
          <p className="text-xs text-subtle sm:text-[13px]">
            {showAuthor && card.authors ? `${card.authors} · ` : null}
            <time dateTime={card.dateISO}>{card.date}</time>
          </p>
        </div>
      </Link>
    </article>
  )
}
