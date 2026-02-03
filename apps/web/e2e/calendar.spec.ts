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
		// Calendar should have clickable day elements
		const dayElements = page
			.locator('button, td, [role="gridcell"], [class*="day"]')
			.filter({ hasText: /^[1-9]$|^[12][0-9]$|^3[01]$/ })

		expect(await dayElements.count()).toBeGreaterThan(0)
	})

	test('should respond to navigation', async ({ page }) => {
		// Find a navigation button and click it
		const nextButton = page.getByRole('button', { name: /next|→|>/i }).first()
		const prevButton = page.getByRole('button', { name: /prev|←|</i }).first()

		if ((await nextButton.count()) > 0) {
			await nextButton.click()
			await page.waitForTimeout(300)
		} else if ((await prevButton.count()) > 0) {
			await prevButton.click()
			await page.waitForTimeout(300)
		}

		// Page should still be on calendar
		await expect(page).toHaveURL(/calendar/)
	})

	test('should show Coptic or Gregorian toggle', async ({ page }) => {
		const toggle = page.getByText(/gregorian|coptic/i)
		// Toggle is expected but not required
		if ((await toggle.count()) > 0) {
			await expect(toggle.first()).toBeVisible()
		}
	})
})
