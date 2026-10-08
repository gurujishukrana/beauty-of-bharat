import Link from 'next/link'

import type { CardData } from '@/lib/cards'

/** Numbered 1–5 list with saffron serif numerals. */
export function MostReadList({ cards }: { cards: CardData[] }) {
  return (
    <ol>
      {cards.map((card, i) => (
        <li key={card.id} className="border-b border-rule">
          <Link href={card.href} className="group flex gap-[18px] py-[18px]">
            <span
              aria-hidden="true"
              className="w-7 shrink-0 font-serif text-[34px] leading-none text-saffron-text"
            >
              {i + 1}
            </span>
            <span className="font-serif text-[18px] leading-[1.3] font-medium text-ink group-hover:text-green">
              {card.title}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}
