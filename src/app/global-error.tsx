'use client'

/** Last-resort 500 page when the root layout itself fails (no site chrome available). */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{ margin: 0, fontFamily: 'Georgia, serif', color: '#16161D', background: '#fff' }}
      >
        <div style={{ display: 'flex', height: 4 }} aria-hidden="true">
          <span style={{ flex: 1, background: '#F1923F' }} />
          <span style={{ flex: 1, background: '#232357' }} />
          <span style={{ flex: 1, background: '#108547' }} />
        </div>
        <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 20px' }}>
          <p
            style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0E7A41',
            }}
          >
            Something went wrong
          </p>
          <h1 style={{ fontSize: 44, fontWeight: 500, lineHeight: 1.05, margin: '12px 0 16px' }}>
            This page didn’t load
          </h1>
          <p
            style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: 17,
              lineHeight: 1.6,
              color: '#3A3A44',
            }}
          >
            Please try again in a moment.
          </p>
          <p
            style={{ display: 'flex', gap: 12, marginTop: 24, fontFamily: 'system-ui, sans-serif' }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                background: '#16161D',
                color: '#fff',
                border: 0,
                padding: '14px 22px',
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 2,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the router may be broken here */}
            <a
              href="/"
              style={{
                border: '1.5px solid #16161D',
                color: '#16161D',
                padding: '13px 22px',
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 2,
                textDecoration: 'none',
              }}
            >
              Go to the homepage
            </a>
          </p>
        </main>
      </body>
    </html>
  )
}
