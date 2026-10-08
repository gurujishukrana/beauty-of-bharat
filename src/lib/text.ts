/** Words per minute used for "N min read". */
export const WORDS_PER_MINUTE = 200

export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/u).length
}

/** Minutes to read `text`, rounded up, never less than 1. */
export function calculateReadTime(text: string, wpm = WORDS_PER_MINUTE): number {
  return Math.max(1, Math.ceil(countWords(text) / wpm))
}

/**
 * Clean, lowercase, hyphenated URL slug. Accented Latin letters are folded to ASCII;
 * anything else that isn't a letter or digit becomes a hyphen.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’‘`]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
    .replace(/-+$/g, '')
}

/** Two-letter initials for avatar placeholders: "Harleen Kaur" → "HK". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/** "A", "A and B", "A, B and C". */
export function joinNames(names: string[], and = 'and'): string {
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} ${and} ${names[names.length - 1]}`
}

type LexicalNode = {
  type?: string
  text?: string
  children?: LexicalNode[]
  fields?: { blockType?: string; quote?: string }
}

const BLOCK_TYPES = new Set(['paragraph', 'heading', 'listitem', 'quote', 'list'])

/**
 * Plain text from a Lexical editor state. Used for read time and search.
 * Pull quotes count as story text; image and video captions do not.
 */
export function lexicalToPlainText(state: unknown): string {
  const root = (state as { root?: LexicalNode } | null | undefined)?.root
  if (!root) return ''
  const out: string[] = []

  const walk = (node: LexicalNode) => {
    if (typeof node.text === 'string') out.push(node.text)
    if (node.type === 'block' && node.fields?.blockType === 'pullQuote' && node.fields.quote) {
      out.push(`\n${node.fields.quote}\n`)
    }
    node.children?.forEach(walk)
    if (node.type && BLOCK_TYPES.has(node.type)) out.push('\n')
  }

  walk(root)
  return out
    .join('')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

/** Split a search query into lowercase terms, dropping one-letter noise. */
export function searchTerms(query: string): string[] {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/\s+/)
        .map((t) => t.replace(/[^\p{L}\p{N}-]/gu, ''))
        .filter((t) => t.length >= 2),
    ),
  ).slice(0, 8)
}

/** A short excerpt of `text` around the first match of any term. */
export function excerptAround(text: string, terms: string[], radius = 110): string {
  if (!text) return ''
  const lower = text.toLowerCase()
  let index = -1
  for (const term of terms) {
    const i = lower.indexOf(term)
    if (i !== -1 && (index === -1 || i < index)) index = i
  }
  if (index === -1) return truncate(text, radius * 2)
  const start = Math.max(0, index - radius)
  const end = Math.min(text.length, index + radius)
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`
}
