import { TricolourRule } from '@/components/TricolourRule'

/** Serif italic quote with a short tricolour rule above it. */
export function PullQuote({ quote, attribution }: { quote: string; attribution?: string | null }) {
  return (
    <blockquote className="my-[30px] sm:my-11">
      <TricolourRule variant="short" className="mb-3.5 sm:mb-5" />
      <p className="font-serif text-[25px] leading-[1.3] text-ink italic sm:text-[32px]">{quote}</p>
      {attribution ? (
        <footer className="mt-3.5 font-sans text-sm text-subtle">— {attribution}</footer>
      ) : null}
    </blockquote>
  )
}
