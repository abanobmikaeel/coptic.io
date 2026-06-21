import { expect, test } from '@playwright/test'

test.describe('Calendar page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/calendar')
		await page.waitForLoadState('networkidle')
	})

	test('should load the page', async ({ page }) => {
		await expect(page).toHaveURL(/calendar/)
	})

	test('should display date information', async ({ page }) => {
		// Calendar should show some date-related content
		// Could be month names, day numbers, or Coptic dates
		const dateContent = page.locator('body')
		const text = await dateContent.textContent()

		// Should contain either month names, numbers, or date-related text
		const hasDateContent =
			/january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}/i.test(
				text || '',
			)
		expect(hasDateContent).toBeTruthy()
	})

	test('should have navigation controls', async ({ page }) => {
		// Look for any navigation buttons (prev/next or arrows)
		const navButtons = page.locator('button').filter({
			has: page.locator('svg, [class*="arrow"], [class*="chevron"]'),
		})

		const textNavButtons = page.getByRole('button', { name: /previous|next|prev|today|</i })

		const hasNav = (await navButtons.count()) > 0 || (await textNavButtons.count()) > 0
		// Navigation is expected
		expect(hasNav).toBeTruthy()
	})

	test('should display day grid', async ({ page }) => {
		// Day cells render as buttons whose label starts with the day number
		// (e.g. textContent "13P" — number + fasting mark in child spans), one per
		// day of the month — at least 28 in any month.
		const dayCells = page.locator('main').getByRole('button').filter({ hasText: /^\d/ })

		expect(await dayCells.count()).toBeGreaterThanOrEqual(28)
	})

	test('should respond to navigation', async ({ page }) => {
		// Drive navigation via the month selector — the prev/next buttons are
		// off-viewport on very small screens (iPhone SE). Pick a different month
		// by index (values are numeric, so index is the value-agnostic choice).
		const monthSelect = page.getByRole('combobox', { name: /select month/i })
		const selectedMonth = monthSelect.locator('option:checked')

		const before = await selectedMonth.textContent()
		const currentIndex = await monthSelect.evaluate((s: HTMLSelectElement) => s.selectedIndex)
		await monthSelect.selectOption({ index: currentIndex === 0 ? 1 : 0 })

		await expect.poll(() => selectedMonth.textContent()).not.toBe(before)
	})
})
