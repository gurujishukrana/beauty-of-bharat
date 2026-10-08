import Link from 'next/link'

import { Mark } from '@/components/Logo'
import { RichText } from '@/components/RichText'
import { cn } from '@/lib/cn'
import type { Page } from '@/payload-types'

type Block = Page['layout'][number]

/** Numerals cycle saffron / navy / green, as on the About design. */
const NUMERAL_COLOURS = ['text-saffron-text', 'text-navy', 'text-green-text']

/** Renders the About/legal page blocks in the approved layout. The first heading is the page's h1. */
export function PageBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.blockType) {
          case 'statementHero':
            return (
              <section key={block.id ?? i} className="container-site flex flex-wrap items-center gap-10 pt-12 pb-12 sm:gap-14 sm:pt-[88px] sm:pb-[72px]">
                <div className="flex min-w-0 flex-[3_1_560px] flex-col gap-5 sm:gap-6">
                  {block.kicker ? <p className="kicker sm:text-xs">{block.kicker}</p> : null}
                  <h1 className="font-serif text-[36px] leading-[1.06] font-medium tracking-[-0.015em] sm:text-[64px] sm:leading-[1.04]">
                    {block.heading}
                  </h1>
                </div>
                {block.showMark ? (
                  <div className="flex flex-[1_1_240px] justify-center max-sm:hidden">
                    <Mark size={220} />
                  </div>
                ) : null}
              </section>
            )
          case 'twoColumnText':
            return (
              <section key={block.id ?? i} className="border-y border-rule">
                <div className="container-site flex flex-wrap gap-6 py-10 sm:gap-14 sm:py-16">
                  <h2 className="min-w-0 flex-[1_1_280px] font-serif text-[28px] leading-[1.15] font-medium sm:text-[32px]">
                    {block.heading}
                  </h2>
                  <div className="prose-simple min-w-0 flex-[2_1_520px] font-serif text-[19px] leading-[1.65] text-ink-2 sm:text-[21px] [&_a]:text-green-text [&_a]:underline">
                    <RichText data={block.body} />
                  </div>
                </div>
              </section>
            )
          case 'numberedList':
            return (
              <section key={block.id ?? i} className="container-site py-12 sm:py-[72px]">
                <div className="mb-8 border-t-2 border-ink pt-[18px] sm:mb-9">
                  <h2 className="font-serif text-[28px] font-medium sm:text-[32px]">{block.heading}</h2>
                </div>
                <ol className="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] sm:gap-y-10">
                  {(block.items ?? []).map((item, n) => (
                    <li key={item.id ?? n} className="flex items-start gap-[18px]">
                      <span
                        aria-hidden="true"
                        className={cn('w-9 shrink-0 font-serif text-[30px] leading-none', NUMERAL_COLOURS[n % 3])}
                      >
                        {String(n + 1).padStart(2, '0')}
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <h3 className="text-lg font-bold">{item.title}</h3>
                        {item.text ? <p className="text-[15px] leading-[1.6] text-muted">{item.text}</p> : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )
          case 'cardGrid':
            return (
              <section key={block.id ?? i} className={block.background === 'white' ? 'bg-paper' : 'bg-sand'}>
                <div className="container-site py-12 sm:py-[72px]">
                  <div className="mb-8 border-t-2 border-ink pt-[18px] sm:mb-9">
                    <h2 className="font-serif text-[28px] font-medium sm:text-[32px]">{block.heading}</h2>
                  </div>
                  <ul className="grid grid-cols-1 gap-5 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] sm:gap-8">
                    {(block.cards ?? []).map((card, n) => (
                      <li
                        key={card.id ?? n}
                        className={cn('flex flex-col gap-2.5 p-6 sm:p-7', block.background === 'white' ? 'border border-rule' : 'bg-paper')}
                      >
                        <h3 className="font-serif text-2xl font-medium">{card.title}</h3>
                        {card.text ? <p className="text-[15px] leading-[1.6] text-muted">{card.text}</p> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )
          case 'ctaRow':
            return (
              <section key={block.id ?? i} className="container-site flex flex-wrap items-center justify-between gap-6 pt-12 pb-14 sm:pt-[72px] sm:pb-[88px]">
                <h2 className="max-w-[640px] font-serif text-[28px] leading-[1.15] font-medium sm:text-[36px]">
                  {block.heading}
                </h2>
                <div className="flex flex-wrap gap-3 max-sm:w-full max-sm:flex-col">
                  {block.primary?.label && block.primary.url ? (
                    <Link
                      href={block.primary.url}
                      className="flex h-12 items-center justify-center rounded-xs bg-ink px-6 text-[15px] font-semibold text-white hover:text-white"
                    >
                      {block.primary.label}
                    </Link>
                  ) : null}
                  {block.secondary?.label && block.secondary.url ? (
                    <Link
                      href={block.secondary.url}
                      className="flex h-12 items-center justify-center rounded-xs border-[1.5px] border-ink px-6 text-[15px] font-semibold text-ink"
                    >
                      {block.secondary.label}
                    </Link>
                  ) : null}
                </div>
              </section>
            )
          case 'richText':
            return (
              <div key={block.id ?? i} className="px-4 pb-14 sm:px-10 sm:pb-20">
                <RichText data={block.content} className="article-body" />
              </div>
            )
          default:
            return null
        }
      })}
    </>
  )
}
