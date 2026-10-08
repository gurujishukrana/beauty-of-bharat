'use client'

import { ErrorView } from '@/components/ErrorView'
import { copy } from '@/lib/copy'

/** 500 page for errors inside the site layout. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorView
      kicker={copy.error.kicker}
      title={copy.error.title}
      text={copy.error.text}
      action={
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-xs border-[1.5px] border-ink px-6 py-[13px] text-[15px] font-semibold text-ink"
        >
          {copy.error.retry}
        </button>
      }
    />
  )
}
