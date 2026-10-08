import { readFile } from 'fs/promises'
import path from 'path'
import { ImageResponse } from 'next/og'

const root = process.cwd()
const assets = Promise.all([
  readFile(path.join(root, 'src/assets/fonts/Newsreader-Medium.ttf')),
  readFile(path.join(root, 'public/brand/logo-color.svg'), 'utf8'),
])

/**
 * Generated social image (1200×630) for stories and profiles without their own image:
 * white ground, tricolour strip, serif headline and the logo. No photos are invented.
 */
export async function renderOgImage({
  kicker,
  title,
  footer,
}: {
  kicker?: string
  title: string
  footer?: string
}) {
  const [font, logoSvg] = await assets
  const logo = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`
  const size = title.length > 90 ? 54 : title.length > 60 ? 62 : 72

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
      }}
    >
      <div style={{ display: 'flex', height: 14 }}>
        <div style={{ flex: 1, background: '#F1923F' }} />
        <div style={{ flex: 1, background: '#232357' }} />
        <div style={{ flex: 1, background: '#108547' }} />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '64px 80px 56px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {kicker ? (
            <div
              style={{
                fontSize: 24,
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: '#0E7A41',
                fontFamily: 'Newsreader',
              }}
            >
              {kicker}
            </div>
          ) : null}
          <div
            style={{
              fontFamily: 'Newsreader',
              fontSize: size,
              lineHeight: 1.08,
              color: '#16161D',
              letterSpacing: -1,
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- rendered to a PNG */}
          <img src={logo} width={344} height={46} />
          {footer ? (
            <div style={{ fontFamily: 'Newsreader', fontSize: 26, color: '#5B5B66' }}>{footer}</div>
          ) : null}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Newsreader', data: font, weight: 500, style: 'normal' }],
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
    },
  )
}
