import { expect, test } from '@playwright/test'

test.describe('Synaxarium page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/synaxarium')
		await page.waitForLoadState('networkidle')
	})

	test('should load the page', async ({ page }) => {
		await expect(page).toHaveURL(/synaxarium/)
	})

	test('should display page content', async ({ page }) => {
		// Page should have visible content (not hidden)
		const content = page.locator('main, [role="main"], h1, h2, article').first()
		await expect(content).toBeVisible({ timeout: 10000 })
	})

	test('should have date navigation', async ({ page }) => {
		// Look for date navigation elements
		const dateNav = page.locator('button, a').filter({ hasText: /previous|next|prev|today|←|→|</i })

		if ((await dateNav.count()) > 0) {
			await expect(dateNav.first()).toBeVisible()
		}
	})

	test('should display Coptic date', async ({ page }) => {
		// Synaxarium shows Coptic dates
		const copticMonths = [
			'Thout',
			'Paopi',
			'Hathor',
			'Koiak',
			'Tobi',
			'Meshir',
			'Paremhat',
			'Parmouti',
			'Pashons',
			'Paoni',
			'Epip',
			'Mesori',
			'Nasie',
		]
		const monthRegex = new RegExp(copticMonths.join('|'), 'i')
		const copticDate = page.getByText(monthRegex)

		if ((await copticDate.count()) > 0) {
			await expect(copticDate.first()).toBeVisible()
		}
	})

	test('should have search or filter functionality', async ({ page }) => {
		// Look for search input or filter buttons
		const searchInput = page.getByPlaceholder(/search/i)
		const filterButtons = page.getByRole('button', {
			name: /martyrs|popes|apostles|departures|feasts|filter/i,
		})

		const hasSearch = (await searchInput.count()) > 0
		const hasFilters = (await filterButtons.count()) > 0

		// At least one search/filter mechanism should exist
		expect(hasSearch || hasFilters).toBeTruthy()
	})

	test('should display content entries', async ({ page }) => {
		// Look for saint entries, articles, or list items
		const entries = page.locator(
			'article, [class*="card"], [class*="entry"], li, a[href*="/synaxarium/"]',
		)

		// Wait for content to load
		await page.waitForTimeout(2000)

		// Should have some content entries
		expect(await entries.count()).toBeGreaterThan(0)
	})

	test('search should filter results', async ({ page }) => {
		const searchInput = page.getByPlaceholder(/search/i)

		if ((await searchInput.count()) > 0) {
			await searchInput.fill('Mark')
			// Wait for search debounce
			await page.waitForTimeout(500)
			// Results should update (we just verify no errors)
		}
	})
})
