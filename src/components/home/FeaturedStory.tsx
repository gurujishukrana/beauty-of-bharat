import Link from 'next/link'

import { ArrowRightIcon } from '@/components/Icons'
import { MediaImage } from '@/components/MediaImage'
import { toImage } from '@/lib/media'
import { kicker, type CardData } from '@/lib/cards'
import { copy } from '@/lib/copy'
import type { ArticleSummary } from '@/lib/queries'

/** Lead story (3:2 image ≈ 2/3 width + text column), with two secondary headlines below. */
export function FeaturedStory({
  article,
  card,
  secondary,
}: {
  article: ArticleSummary
  card: CardData
  secondary: CardData[]
}) {
  const image = toImage(article.heroImage, 'feature')
  return (
    <section className="container-site pt-[18px] pb-7 sm:pt-7 sm:pb-14" aria-labelledby="featured-story">
      <div className="flex flex-wrap items-stretch gap-3.5 sm:gap-10 sm:border-t-2 sm:border-ink sm:pt-7">
        <Link href={card.href} className="block min-w-0 flex-[2_1_560px]" tabIndex={-1} aria-hidden="true">
          <MediaImage
            image={image}
            aspect="3/2"
            sizes="(max-width: 759px) 100vw, (max-width: 1280px) 64vw, 800px"
            priority
            placeholderLabel={card.place ? `${copy.home.featuredPhoto} · ${card.place}` : copy.home.featuredPhoto}
            className="max-sm:aspect-[4/3]!"
          />
        </Link>
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3.5 sm:gap-[18px]">
          <p className="kicker sm:text-xs">{kicker(card.category, card.place)}</p>
          <h2
            id="featured-story"
            className="font-serif text-[31px] leading-[1.1] font-medium tracking-[-0.01em] sm:text-[44px] sm:leading-[1.08]"
          >
            <Link href={card.href} className="text-ink hover:text-green">
              {card.title}
            </Link>
          </h2>
          <p className="text-base leading-normal text-body sm:text-[17px] sm:leading-[1.55]">{card.deck}</p>
          <p className="flex flex-wrap gap-2 text-[13px] text-subtle">
            {card.authors ? (
              <>
                <span className="font-semibold text-ink">
                  <span className="max-sm:hidden">{copy.article.by} </span>
                  {card.authors}
                </span>
                <span aria-hidden="true">·</span>
              </>
            ) : null}
            <time dateTime={card.dateISO}>
              <span className="sm:hidden">{card.date}</span>
              <span className="max-sm:hidden">{card.dateLong}</span>
            </time>
            <span aria-hidden="true" className="max-sm:hidden">
              ·
            </span>
            <span className="max-sm:hidden">{copy.article.minRead(card.readTime)}</span>
          </p>
          <div>
            <Link
              href={card.href}
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xs bg-ink px-[22px] text-[15px] font-semibold text-white hover:bg-[#2a2a33] hover:text-white max-sm:w-full"
            >
              {copy.home.readStory} <ArrowRightIcon />
            </Link>
          </div>
          {secondary.length > 0 && (
            <ul className="mt-auto flex flex-col gap-4 border-t border-rule pt-[18px]">
              {secondary.map((s, i) => (
                <li key={s.id} className={i > 0 ? 'border-t border-rule pt-4' : undefined}>
                  <Link href={s.href} className="group block">
                    <p className="kicker mb-1.5">{s.category}</p>
                    <h3 className="font-serif text-[20px] leading-[1.25] font-medium text-ink group-hover:text-green">
                      {s.title}
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
