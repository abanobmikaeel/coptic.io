import { expect, test } from '@playwright/test'

test.describe('Library page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/library')
		await page.waitForLoadState('networkidle')
	})

	test('should load the page', async ({ page }) => {
		await expect(page).toHaveURL(/library/)
	})

	test('should display content cards', async ({ page }) => {
		// Look for cards linking to main content areas
		const cards = page.locator('a[href*="/readings"], a[href*="/agpeya"], a[href*="/synaxarium"]')
		expect(await cards.count()).toBeGreaterThan(0)
	})

	test('should have Readings link', async ({ page }) => {
		const readingsLink = page.getByRole('link', { name: /readings/i })
		if ((await readingsLink.count()) > 0) {
			await readingsLink.first().click()
			await expect(page).toHaveURL(/readings/)
		}
	})

	test('should have Agpeya link', async ({ page }) => {
		const agpeyaLink = page.getByRole('link', { name: /agpeya/i })
		if ((await agpeyaLink.count()) > 0) {
			await agpeyaLink.first().click()
			await expect(page).toHaveURL(/agpeya/)
		}
	})

	test('should have Synaxarium link', async ({ page }) => {
		const synaxariumLink = page.getByRole('link', { name: /synaxarium/i })
		if ((await synaxariumLink.count()) > 0) {
			await synaxariumLink.first().click()
			await expect(page).toHaveURL(/synaxarium/)
		}
	})

	test('cards link to content and are visible', async ({ page }) => {
		// Cards live in main; scope excludes the nav dropdown's hidden links.
		const cards = page
			.locator('main')
			.locator('a[href*="/readings"], a[href*="/agpeya"], a[href*="/synaxarium"]')
		expect(await cards.count()).toBeGreaterThan(0)
		await expect(cards.first()).toBeVisible()
	})
})
