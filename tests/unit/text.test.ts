import { describe, expect, it } from 'vitest'

import {
  calculateReadTime,
  countWords,
  excerptAround,
  initials,
  joinNames,
  lexicalToPlainText,
  searchTerms,
  slugify,
} from '@/lib/text'

describe('calculateReadTime', () => {
  it('rounds up at 200 words per minute', () => {
    expect(calculateReadTime('word '.repeat(200))).toBe(1)
    expect(calculateReadTime('word '.repeat(201))).toBe(2)
    expect(calculateReadTime('word '.repeat(1200))).toBe(6)
  })

  it('is never less than one minute', () => {
    expect(calculateReadTime('')).toBe(1)
    expect(calculateReadTime('   ')).toBe(1)
  })

  it('counts words across any whitespace', () => {
    expect(countWords('one  two\nthree\tfour')).toBe(4)
  })
})

describe('slugify', () => {
  it('makes clean, lowercase, hyphenated slugs', () => {
    expect(slugify('In a Ludhiana village, a retired teacher’s courtyard')).toBe(
      'in-a-ludhiana-village-a-retired-teachers-courtyard',
    )
  })

  it('folds accents, removes apostrophes and collapses punctuation', () => {
    expect(slugify("  Café — Délhi's  Best!! ")).toBe('cafe-delhis-best')
    expect(slugify('Arts & Crafts')).toBe('arts-and-crafts')
  })

  it('never starts or ends with a hyphen and caps the length', () => {
    const long = slugify('a '.repeat(200))
    expect(long.length).toBeLessThanOrEqual(96)
    expect(long.startsWith('-') || long.endsWith('-')).toBe(false)
  })
})

describe('lexicalToPlainText', () => {
  const state = {
    root: {
      type: 'root',
      children: [
        { type: 'paragraph', children: [{ type: 'text', text: 'First paragraph.' }] },
        { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'A heading' }] },
        { type: 'block', fields: { blockType: 'pullQuote', quote: 'A quote.' } },
        { type: 'block', fields: { blockType: 'imageBlock', caption: 'Not counted' } },
        {
          type: 'paragraph',
          children: [
            { type: 'text', text: 'With ' },
            { type: 'link', children: [{ type: 'text', text: 'a link' }] },
            { type: 'text', text: '.' },
          ],
        },
      ],
    },
  }

  it('extracts story text including pull quotes but not captions', () => {
    expect(lexicalToPlainText(state)).toBe('First paragraph.\nA heading\nA quote.\nWith a link.')
  })

  it('handles empty input', () => {
    expect(lexicalToPlainText(null)).toBe('')
    expect(lexicalToPlainText({})).toBe('')
  })
})

describe('names', () => {
  it('builds initials', () => {
    expect(initials('Harleen Kaur')).toBe('HK')
    expect(initials('Temjen Ao')).toBe('TA')
    expect(initials('Madonna')).toBe('MA')
    expect(initials('Anna Maria Sharma')).toBe('AS')
  })

  it('joins bylines naturally', () => {
    expect(joinNames(['A'])).toBe('A')
    expect(joinNames(['A', 'B'])).toBe('A and B')
    expect(joinNames(['A', 'B', 'C'])).toBe('A, B and C')
  })
})

describe('search helpers', () => {
  it('splits queries into unique terms', () => {
    expect(searchTerms('  School  school, Pune! a ')).toEqual(['school', 'pune'])
  })

  it('excerpts around the first match', () => {
    const text = `${'x '.repeat(200)}the library opened ${'y '.repeat(200)}`
    const out = excerptAround(text, ['library'], 30)
    expect(out).toContain('library')
    expect(out.startsWith('…')).toBe(true)
  })
})
