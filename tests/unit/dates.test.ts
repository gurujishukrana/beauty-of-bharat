import { describe, expect, it } from 'vitest'

import { formatDate, formatLongDate, formatMonthYear, formatShortDate } from '@/lib/dates'
import { pageWindow } from '@/lib/pagination'

describe('dates (Asia/Kolkata)', () => {
  it('formats the utility-bar date', () => {
    expect(formatLongDate('2026-10-08T06:00:00Z')).toBe('Thursday, 8 October 2026')
  })

  it('uses India time, not UTC: 20:00 UTC is already the next day in IST', () => {
    expect(formatDate('2026-10-07T20:00:00Z')).toBe('8 October 2026')
    expect(formatDate('2026-10-07T18:00:00Z')).toBe('7 October 2026')
  })

  it('formats card and press-card dates', () => {
    expect(formatShortDate('2026-09-29T04:00:00Z')).toBe('29 Sep 2026')
    expect(formatMonthYear('2024-03-01T00:00:00Z')).toBe('March 2024')
  })
})

describe('pageWindow', () => {
  it('shows all pages when there are few', () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3])
  })

  it('collapses long ranges with gaps', () => {
    expect(pageWindow(5, 10)).toEqual([1, 'gap', 4, 5, 6, 'gap', 10])
    expect(pageWindow(1, 10)).toEqual([1, 2, 'gap', 10])
  })
})
