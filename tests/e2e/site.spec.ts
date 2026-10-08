import { expect, test } from '@playwright/test'

import { expectNoSeriousA11yIssues } from './helpers'

test.describe('reading the site', () => {
  test('home loads with a featured story and passes axe', async ({ page }) => {
    await page.goto('/')
    const featured = page.locator('#featured-story')
    await expect(featured).toBeVisible()
    await expect(page.getByRole('link', { name: /Read story/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Latest news' })).toBeVisible()
    await expectNoSeriousA11yIssues(page)
  })

  test('opening an article from a card', async ({ page }) => {
    await page.goto('/')
    const card = page.locator('article a[href^="/news/"]').first()
    const title = (await card.locator('h3').textContent())?.trim() ?? ''
    await card.click()
    await expect(page).toHaveURL(/\/news\/[a-z0-9-]+$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
    await expectNoSeriousA11yIssues(page)
  })

  test('author link leads to a profile that lists the article', async ({ page }, info) => {
    await page.goto(
      '/news/in-a-ludhiana-village-a-retired-teachers-courtyard-has-become-the-evening-school',
    )
    const title = (await page.getByRole('heading', { level: 1 }).textContent())?.trim() ?? ''
    if (info.project.name === 'mobile') {
      await page.getByRole('link', { name: /More stories by Harleen/ }).click()
    } else {
      await page.getByRole('link', { name: 'Harleen Kaur', exact: true }).first().click()
    }
    await expect(page).toHaveURL(/\/people\/harleen-kaur$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Harleen Kaur')
    await expect(page.getByText('BOB/004').first()).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: title })).toBeVisible()
    await expectNoSeriousA11yIssues(page)
  })

  test('people filters and search work through the URL', async ({ page }) => {
    await page.goto('/people')
    await expect(page.locator('article')).toHaveCount(8)
    await expectNoSeriousA11yIssues(page)

    await page.getByRole('link', { name: 'Reporters', exact: true }).click()
    await expect(page).toHaveURL(/role=reporter/)
    await expect(page.getByRole('heading', { name: 'Rohit Bains' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Harleen Kaur' })).toBeVisible()

    await page.goto('/people')
    const search = page.getByRole('searchbox', { name: 'Search by name or location' })
    await search.fill('pune')
    await search.press('Enter')
    await expect(page).toHaveURL(/q=pune/)
    await expect(page.locator('article')).toHaveCount(1)
    await expect(page.getByRole('heading', { name: 'Priya Raghavan' })).toBeVisible()
  })

  test('news, category, about, search and legal pages pass axe', async ({ page }) => {
    for (const path of [
      '/news',
      '/category/ground-reports',
      '/about',
      '/search?q=school',
      '/privacy',
    ]) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expectNoSeriousA11yIssues(page)
    }
  })

  test('styled 404 page', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist')
    expect(res?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'We couldn’t find that page' })).toBeVisible()
    await expect(page.getByRole('searchbox')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Read the latest news' })).toBeVisible()
    await expectNoSeriousA11yIssues(page)
  })

  test('hidden people return 404', async ({ page }) => {
    const res = await page.goto('/people/not-a-real-person')
    expect(res?.status()).toBe(404)
  })
})

test.describe('mobile menu', () => {
  test('opens and closes with the keyboard, trapping focus', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'The menu button only exists on phones')
    await page.goto('/')
    const open = page.getByRole('button', { name: 'Open menu' })
    await open.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(page.getByRole('button', { name: 'Close menu' })).toBeFocused()
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')

    // Shift+Tab from the first item wraps to the last one (focus stays inside).
    await page.keyboard.press('Shift+Tab')
    await expect(dialog.getByRole('link', { name: 'Send us a news tip' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Close menu' })).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(open).toBeFocused()
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
  })
})
