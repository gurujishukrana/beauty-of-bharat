// Captures admin screenshots for EDITOR_GUIDE.md (docs/images). Needs a seeded local site.
// Usage: node scripts/admin-screenshots.mjs
import 'dotenv/config'
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const base = process.env.BASE_URL || 'http://localhost:3000'
const out = 'docs/images'
await mkdir(out, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const login = await page.request.post(`${base}/api/users/login`, {
  data: { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD },
})
if (!login.ok()) throw new Error('Admin login failed — run `pnpm seed` first.')

async function shot(path, file, prepare) {
  await page.goto(base + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  if (prepare) await prepare()
  await page.screenshot({ path: `${out}/${file}.png` })
  console.log(`${out}/${file}.png`)
}

const first = async (collection, where = '') => {
  const res = await page.request.get(`${base}/api/${collection}?limit=1&depth=0${where}`)
  return (await res.json()).docs[0].id
}
const articleId = await first('articles', '&where[slug][like]=courtyard')
const personId = await first('people', '&where[slug][equals]=harleen-kaur')

await shot('/admin', '01-dashboard')
await shot('/admin/collections/articles', '02-articles-list')
await shot(`/admin/collections/articles/${articleId}`, '03-article-editor')
await shot(`/admin/collections/articles/${articleId}`, '04-article-seo', async () => {
  await page.getByRole('button', { name: 'SEO', exact: true }).click()
  await page.waitForTimeout(800)
})
await shot(`/admin/collections/people/${personId}`, '05-person-press-card', async () => {
  await page.getByRole('button', { name: 'Press card', exact: true }).click()
  await page.waitForTimeout(800)
})
await shot('/admin/globals/siteSettings', '06-site-settings-contact', async () => {
  await page.getByRole('button', { name: 'Contact', exact: true }).click()
  await page.waitForTimeout(800)
})
await shot('/admin/collections/contactSubmissions', '07-contact-messages')

await browser.close()
