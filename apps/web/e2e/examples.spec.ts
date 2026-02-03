import { expect, test } from '@playwright/test'

test.describe('API Examples page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/examples')
		await page.waitForLoadState('networkidle')
	})

	test('should load the page', async ({ page }) => {
		await expect(page).toHaveURL(/examples/)
	})

	test('should display page title', async ({ page }) => {
		await expect(page.getByRole('heading', { name: /API Examples/i })).toBeVisible()
	})

	test('should show example list in sidebar', async ({ page }) => {
		const examples = [
			"Today's Readings",
			'Coptic Date',
			'Fasting Status',
			'Upcoming Celebrations',
			'Synaxarium Search',
			'Liturgical Season',
		]

		for (const example of examples) {
			// Use first() since text appears in both title and description
			await expect(
				page.getByRole('button', { name: new RegExp(example, 'i') }).first(),
			).toBeVisible()
		}
	})

	test('should show endpoint for selected example', async ({ page }) => {
		// Default example should show /readings endpoint
		await expect(page.getByText('GET /readings')).toBeVisible()
	})

	test('should show code snippet', async ({ page }) => {
		await expect(page.getByText(/await fetch/)).toBeVisible()
	})

	test('should have Try it button', async ({ page }) => {
		const tryButton = page.getByRole('button', { name: /try it/i })
		await expect(tryButton).toBeVisible()
	})

	test('should switch examples when clicking sidebar', async ({ page }) => {
		// Click on Coptic Date example
		await page.getByRole('button', { name: /Coptic Date/i }).click()

		// Should update endpoint display (the code element specifically)
		await expect(page.locator('code').filter({ hasText: 'GET /calendar/' })).toBeVisible()
	})

	test('should make API call and show response', async ({ page }) => {
		const tryButton = page.getByRole('button', { name: /try it/i })
		await tryButton.click()

		// Wait for loading to complete
		await expect(tryButton).not.toHaveText(/loading/i, { timeout: 10000 })

		// Response section should appear (use exact match to avoid matching "response" in code)
		await expect(page.getByText('Response', { exact: true })).toBeVisible()
	})
})
