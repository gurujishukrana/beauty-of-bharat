// Generates favicon.ico, apple-icon.png and manifest icons from brand/mark-color.svg.
// The mark sits on white with padding; it is never stretched or recoloured.
// Run with `pnpm icons` after changing the mark.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const mark = await readFile(path.join(root, 'brand/mark-color.svg'))

async function icon(size, padding = 0.14) {
  const inner = Math.round(size * (1 - padding * 2))
  const art = await sharp(mark, { density: 1200 })
    .resize(inner, inner, { fit: 'contain', background: '#ffffff' })
    .png()
    .toBuffer()
  return sharp({ create: { width: size, height: size, channels: 4, background: '#ffffff' } })
    .composite([{ input: art, gravity: 'center' }])
    .png()
    .toBuffer()
}

/** ICO container holding PNG images (supported by every current browser). */
function ico(pngs) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(pngs.length, 4)
  const entries = []
  let offset = 6 + 16 * pngs.length
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0)
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2)
    e.writeUInt8(0, 3)
    e.writeUInt16LE(1, 4)
    e.writeUInt16LE(32, 6)
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += data.length
    entries.push(e)
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)])
}

const appDir = path.join(root, 'src/app')
const iconsDir = path.join(root, 'public/icons')
await mkdir(iconsDir, { recursive: true })

await writeFile(path.join(appDir, 'apple-icon.png'), await icon(180))
await writeFile(path.join(iconsDir, 'icon-192.png'), await icon(192))
await writeFile(path.join(iconsDir, 'icon-512.png'), await icon(512))
await writeFile(path.join(iconsDir, 'maskable-512.png'), await icon(512, 0.22))
await writeFile(
  path.join(appDir, 'favicon.ico'),
  ico([
    { size: 16, data: await icon(16, 0.06) },
    { size: 32, data: await icon(32, 0.08) },
    { size: 48, data: await icon(48, 0.1) },
  ]),
)
// Default share image (1200×630): the full logo centred on white. Used as og:image / twitter:image
// when Site settings → Default sharing image is empty.
const logo = await sharp(await readFile(path.join(root, 'brand/logo-color.svg')), { density: 600 })
  .resize({ width: 760 })
  .png()
  .toBuffer()
await writeFile(
  path.join(root, 'public/og-default.png'),
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#ffffff' } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toBuffer(),
)
console.log('Icons written to src/app and public/icons; share image to public/og-default.png')
