'use client'

import { useFormFields } from '@payloadcms/ui'

const TITLE_LIMIT = 60
const DESCRIPTION_LIMIT = 160
const SITE = 'thebeautyofbharat.com'

function Counter({ value, limit }: { value: number; limit: number }) {
  const over = value > limit
  return (
    <span style={{ color: over ? '#B42318' : '#5B5B66', fontWeight: over ? 700 : 400 }}>
      {value}/{limit}
    </span>
  )
}

/** Google-style search result preview with character counters, above the SEO fields. */
export function SeoPreview() {
  const { title, slug, deck, metaTitle, metaDescription } = useFormFields(([fields]) => ({
    title: fields.title?.value as string | undefined,
    slug: fields.slug?.value as string | undefined,
    deck: fields.deck?.value as string | undefined,
    metaTitle: fields['seo.metaTitle']?.value as string | undefined,
    metaDescription: fields['seo.metaDescription']?.value as string | undefined,
  }))

  const shownTitle = `${metaTitle || title || 'Headline'} | Beauty of Bharat`
  const shownDescription = metaDescription || deck || 'The standfirst will be used as the description.'
  const titleLength = (metaTitle || title || '').length
  const descriptionLength = (metaDescription || deck || '').length

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Search result preview</div>
      <div
        style={{
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 4,
          padding: 16,
          background: 'var(--theme-elevation-0)',
          maxWidth: 640,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ fontSize: 12, color: '#4D5156' }}>
          {SITE} › news › {slug || 'story-address'}
        </div>
        <div style={{ fontSize: 20, color: '#1A0DAB', lineHeight: 1.3, margin: '4px 0' }}>
          {shownTitle.length > 70 ? `${shownTitle.slice(0, 68)}…` : shownTitle}
        </div>
        <div style={{ fontSize: 14, color: '#4D5156', lineHeight: 1.5 }}>
          {shownDescription.length > 165 ? `${shownDescription.slice(0, 160)}…` : shownDescription}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 24, fontSize: 12, marginTop: 8 }}>
        <span>
          Title: <Counter value={titleLength} limit={TITLE_LIMIT} />
        </span>
        <span>
          Description: <Counter value={descriptionLength} limit={DESCRIPTION_LIMIT} />
        </span>
      </div>
    </div>
  )
}
