import { expect, test } from '@playwright/test'

import { adminToken, auth, body, expectNoSeriousA11yIssues, fixtures } from './helpers'

test.describe('contact form', () => {
  test.beforeEach(async ({ request }) => {
    // Keep the per-IP rate limit from tripping on repeated runs.
    const token = await adminToken(request)
    await request.delete('/api/contactSubmissions?where[name][like]=E2E', { headers: auth(token) })
  })

  test('shows inline errors, then accepts a valid message', async ({ page, request }) => {
    await page.goto('/contact')
    await expectNoSeriousA11yIssues(page)

    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByText('Please tell us your name.')).toBeVisible()
    await expect(page.getByLabel('Your name')).toHaveAttribute('aria-invalid', 'true')

    await page.getByLabel('Your name').fill('E2E Tester')
    await page.getByLabel('Email or phone').fill('e2e@example.test')
    await page.getByLabel('What is this about?').selectOption('correction')
    await expect(page.getByLabel('Article link')).toBeVisible()
    await page.getByLabel('Article link').fill('https://thebeautyofbharat.com/news/example')
    await page.getByLabel('Message').fill('The date in the second paragraph looks wrong.')
    await page.getByRole('button', { name: 'Send message' }).click()

    await expect(page.getByRole('heading', { name: 'Thanks — we’ve received your message' })).toBeVisible()

    // Saved to the CMS inbox (email goes to the server log when RESEND_API_KEY is unset).
    const token = await adminToken(request)
    const res = await request.get('/api/contactSubmissions?where[name][equals]=E2E%20Tester&depth=0', {
      headers: auth(token),
    })
    const { docs } = await res.json()
    expect(docs[0]).toMatchObject({ topic: 'correction', status: 'new', emailed: true })
  })

  test('correction link pre-fills topic and article', async ({ page }) => {
    await page.goto('/contact?topic=correction&article=https%3A%2F%2Fthebeautyofbharat.com%2Fnews%2Fx')
    await expect(page.getByLabel('What is this about?')).toHaveValue('correction')
    await expect(page.getByLabel('Article link')).toHaveValue('https://thebeautyofbharat.com/news/x')
  })
})

test.describe('publishing', () => {
  test.describe.configure({ mode: 'serial' })

  test('an unpublished article returns 404, and appears once published', async ({ page, request }) => {
    const token = await adminToken(request)
    const f = await fixtures(request, token)
    const slug = `e2e-unpublished-${Date.now()}`
    const created = await request.post('/api/articles?draft=true', {
      headers: auth(token),
      data: {
        title: 'E2E unpublished story',
        slug,
        deck: 'Test',
        body: body('Test body text.'),
        heroImage: f.image,
        primaryCategory: f.category,
        authors: [f.person],
        _status: 'draft',
      },
    })
    expect(created.ok()).toBeTruthy()
    const id = (await created.json()).doc.id

    expect((await page.goto(`/news/${slug}`))?.status()).toBe(404)

    await request.patch(`/api/articles/${id}`, { headers: auth(token), data: { _status: 'published' } })
    expect((await page.goto(`/news/${slug}`))?.status()).toBe(200)

    await request.patch(`/api/articles/${id}`, { headers: auth(token), data: { _status: 'draft' } })
    expect((await page.goto(`/news/${slug}`))?.status()).toBe(404)

    await request.delete(`/api/articles/${id}`, { headers: auth(token) })
  })

  test('a scheduled article appears after its publish time', async ({ page, request }) => {
    const token = await adminToken(request)
    const f = await fixtures(request, token)
    const slug = `e2e-scheduled-${Date.now()}`
    const created = await request.post('/api/articles?draft=true', {
      headers: auth(token),
      data: {
        title: 'E2E scheduled story',
        slug,
        deck: 'Test',
        body: body('Scheduled body text.'),
        heroImage: f.image,
        primaryCategory: f.category,
        authors: [f.person],
        _status: 'draft',
      },
    })
    const id = (await created.json()).doc.id
    // Same as the admin's "Schedule publish" button: queue a publish two seconds from now.
    const job = await request.post(`/api/articles/${id}/schedule`, {
      headers: auth(token),
      data: { publishAt: new Date(Date.now() + 2000).toISOString() },
    })
    expect(job.ok(), await job.text()).toBeTruthy()

    expect((await page.goto(`/news/${slug}`))?.status()).toBe(404)
    await page.waitForTimeout(2500)
    // The test hook: run due jobs now instead of waiting for the cron.
    const run = await request.get('/api/payload-jobs/run?queue=default', { headers: auth(token) })
    expect(run.ok()).toBeTruthy()
    expect((await page.goto(`/news/${slug}`))?.status()).toBe(200)

    await request.delete(`/api/articles/${id}`, { headers: auth(token) })
  })
})
