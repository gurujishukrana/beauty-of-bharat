/** Page numbers to show: always first and last, the current page and its neighbours, with gaps. */
export function pageWindow(current: number, total: number): Array<number | 'gap'> {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total))
  const sorted = [...pages].sort((a, b) => a - b)
  const out: Array<number | 'gap'> = []
  for (const [i, page] of sorted.entries()) {
    if (i > 0 && page - sorted[i - 1] > 1) out.push('gap')
    out.push(page)
  }
  return out
}
