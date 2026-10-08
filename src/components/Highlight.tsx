/** Wraps occurrences of any search term in <mark>. Plain text in, React out (no HTML injection). */
export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length || !text) return <>{text}</>
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-[#FCE6CF] px-0.5 text-ink">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}
