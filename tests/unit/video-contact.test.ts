import { describe, expect, it } from 'vitest'

import { topicFromParam, validateContact } from '@/lib/contact'
import { parseVideoUrl } from '@/lib/video'

describe('parseVideoUrl (allowlist)', () => {
  it('accepts YouTube in its common forms and uses youtube-nocookie', () => {
    for (const url of [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://youtube.com/shorts/dQw4w9WgXcQ',
      'https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=10',
    ]) {
      expect(parseVideoUrl(url)?.embedUrl).toBe(
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0',
      )
    }
  })

  it('accepts Vimeo and Instagram', () => {
    expect(parseVideoUrl('https://vimeo.com/76979871')?.provider).toBe('vimeo')
    expect(parseVideoUrl('https://www.instagram.com/reel/C1a2b3c4d5/')?.embedUrl).toBe(
      'https://www.instagram.com/reel/C1a2b3c4d5/embed',
    )
  })

  it('rejects other hosts and unsafe input', () => {
    expect(parseVideoUrl('https://evil.example/watch?v=dQw4w9WgXcQ')).toBeNull()
    expect(parseVideoUrl('javascript:alert(1)')).toBeNull()
    expect(parseVideoUrl('https://www.youtube.com/watch?v=bad"><script>')).toBeNull()
    expect(parseVideoUrl('')).toBeNull()
  })
})

describe('contact form validation', () => {
  const valid = {
    name: 'Asha',
    contact: 'asha@example.com',
    topic: 'news-tip',
    message: 'A story about our village library.',
    articleUrl: '',
  }

  it('accepts a valid message with email or phone', () => {
    expect(validateContact(valid)).toEqual({})
    expect(validateContact({ ...valid, contact: '+91 98765 43210' })).toEqual({})
  })

  it('reports each problem', () => {
    const errors = validateContact({
      name: '',
      contact: 'nope',
      topic: 'other',
      message: 'short',
      articleUrl: '',
    })
    expect(Object.keys(errors).sort()).toEqual(['contact', 'message', 'name', 'topic'])
  })

  it('requires the article link for corrections', () => {
    expect(validateContact({ ...valid, topic: 'correction' }).articleUrl).toBeTruthy()
    expect(
      validateContact({
        ...valid,
        topic: 'correction',
        articleUrl: 'https://thebeautyofbharat.com/news/x',
      }),
    ).toEqual({})
  })

  it('maps ?topic= values', () => {
    expect(topicFromParam('correction')).toBe('correction')
    expect(topicFromParam('press')).toBe('press')
    expect(topicFromParam(undefined)).toBe('news-tip')
    expect(topicFromParam('whatever')).toBe('news-tip')
  })
})
