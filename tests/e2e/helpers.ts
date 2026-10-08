import AxeBuilder from '@axe-core/playwright'
import { expect, type APIRequestContext, type Page } from '@playwright/test'

/** Logs in as the seeded admin (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD) and returns a JWT. */
export async function adminToken(request: APIRequestContext): Promise<string> {
  const res = await request.post('/api/users/login', {
    data: { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD },
  })
  expect(res.ok(), 'admin login (run `pnpm seed` first)').toBeTruthy()
  return (await res.json()).token
}

export const auth = (token: string) => ({ Authorization: `JWT ${token}` })

/** Fails on serious or critical axe violations. */
export async function expectNoSeriousA11yIssues(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  )
  expect(
    serious.map(
      (v) =>
        `${v.id}: ${v.help} (${v.nodes
          .map((n) => n.target.join(' '))
          .slice(0, 3)
          .join(', ')})`,
    ),
  ).toEqual([])
}

/** Minimal valid article body. */
export const body = (text: string) => ({
  root: {
    type: 'root',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        type: 'paragraph',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
        children: [
          { type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 },
        ],
      },
    ],
  },
})

/** IDs of an existing category, image and person to build test articles with. */
export async function fixtures(request: APIRequestContext, token: string) {
  const get = async (path: string) =>
    (await (await request.get(path, { headers: auth(token) })).json()).docs[0].id
  return {
    category: await get('/api/categories?limit=1&depth=0'),
    image: await get('/api/media?limit=1&depth=0'),
    person: await get('/api/people?limit=1&depth=0&where[slug][equals]=harleen-kaur'),
  }
}
