import { SearchIcon } from '@/components/Icons'
import { copy } from '@/lib/copy'
import { cn } from '@/lib/cn'

/** Plain GET form to /search — works without JavaScript. */
export function SearchForm({
  defaultValue,
  autoFocus,
  className,
  id = 'site-search',
}: {
  defaultValue?: string
  autoFocus?: boolean
  className?: string
  id?: string
}) {
  return (
    <form role="search" action="/search" method="get" className={cn('flex w-full max-w-[560px] gap-2', className)}>
      <label htmlFor={id} className="sr-only">
        {copy.search.label}
      </label>
      <div className="flex h-12 flex-1 items-center gap-2.5 rounded-xs border border-field bg-paper px-3.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-green">
        <SearchIcon size={16} className="shrink-0 text-subtle" />
        <input
          id={id}
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={copy.search.placeholder}
          autoFocus={autoFocus}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-subtle"
        />
      </div>
      <button
        type="submit"
        className="h-12 shrink-0 rounded-xs bg-ink px-5 text-[15px] font-semibold text-white hover:bg-[#2a2a33]"
      >
        {copy.search.button}
      </button>
    </form>
  )
}
