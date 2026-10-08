// Full-page screenshots at desktop (1440) and phone (390) widths for side-by-side comparison
// with design-reference/. Usage: node scripts/screenshots.mjs [outDir] [/path ...]
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const base = process.env.BASE_URL || 'http://localhost:3000'
const [outDir = 'screenshots', ...paths] = process.argv.slice(2)
const pages = paths.length ? paths : ['/', '/news', '/people', '/about', '/contact', '/search?q=school']
const widths = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844, isMobile: true, hasTouch: true },
]

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch()
for (const viewport of widths) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
    hasTouch: viewport.hasTouch,
  })
  const page = await context.newPage()
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: 'networkidle' })
    // Trigger lazy images before capturing.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 60))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(300)
    const file = path.join(outDir, `${viewport.name}-${p.replace(/[^a-z0-9]+/gi, '_') || 'home'}.png`)
    await page.screenshot({ path: file, fullPage: true })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    console.log(`${file}${overflow > 0 ? `  ⚠ horizontal overflow ${overflow}px` : ''}`)
  }
  await context.close()
}
await browser.close()
