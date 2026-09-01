import { test, expect } from '@playwright/test'

test.describe('smoke', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Обираєте країну')
  })

  test('country page loads', async ({ page }) => {
    await page.goto('/country/pl')
    await expect(page.locator('.ch-title, h1').first()).toBeVisible()
    await expect(page.locator('.breadcrumb')).toContainText('Поль')
  })

  test('compare slug page SSR', async ({ page }) => {
    await page.goto('/compare/cz-vs-pl')
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page).toHaveURL(/\/compare\/cz-vs-pl/)
  })

  test('review form loads', async ({ page }) => {
    await page.goto('/review/new')
    await expect(page.locator('.step-card')).toBeVisible()
    await expect(page.getByText('Про себе')).toBeVisible()
    await expect(page.getByText('Оцінки')).toBeVisible()
    // Honeypot present but hidden from layout
    await expect(page.locator('input[name="website"]')).toBeAttached()
  })

  test('homepage map list interaction', async ({ page }) => {
    await page.goto('/')
    const list = page.locator('.map-list')
    await list.scrollIntoViewIfNeeded()
    const firstItem = page.locator('.map-list-item').first()
    await expect(firstItem).toBeVisible({ timeout: 15_000 })
    await firstItem.click()
    await expect(firstItem).toHaveClass(/is-selected/)
  })
})
