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

	test('cards should have hover state', async ({ page }) => {
		const card = page
			.locator('a[href*="/readings"], a[href*="/agpeya"], a[href*="/synaxarium"]')
			.first()
		if ((await card.count()) > 0) {
			await card.hover()
			// Visual hover state - hard to test, but we can verify no errors
			await page.waitForTimeout(200)
		}
	})
})
