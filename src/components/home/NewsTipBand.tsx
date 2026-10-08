import Link from 'next/link'

import { copy } from '@/lib/copy'
import { routes } from '@/lib/url'

/** Navy band inviting news tips. White serif heading; saffron button with ink text. */
export function NewsTipBand() {
  return (
    <section className="bg-navy text-white" aria-labelledby="tip-band-title">
      <div className="container-site flex flex-col gap-3 py-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6 sm:py-14">
        <div className="flex max-w-[640px] flex-col gap-2">
          <h2
            id="tip-band-title"
            className="font-serif text-2xl leading-[1.2] font-medium sm:text-[32px] sm:leading-[1.15]"
          >
            {copy.home.tipTitle}
          </h2>
          <p className="text-base leading-[1.55] text-navy-text max-sm:hidden">
            {copy.home.tipText}
          </p>
        </div>
        <Link
          href={routes.contact}
          className="flex h-12 items-center justify-center rounded-xs bg-saffron px-[26px] text-[15px] font-bold text-ink hover:bg-[#f39f55] hover:text-ink"
        >
          {copy.nav.sendTip}
        </Link>
      </div>
    </section>
  )
}
