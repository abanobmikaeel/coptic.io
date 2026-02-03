import { expect, test } from '@playwright/test'

test.describe('Preferences page', () => {
	test('should load the page', async ({ page }) => {
		await page.goto('/preferences')
		await page.waitForLoadState('networkidle')
		await expect(page).toHaveURL(/preferences/)
	})

	test('should show prompt to use email link when no token', async ({ page }) => {
		await page.goto('/preferences')
		await page.waitForLoadState('networkidle')

		// Without a token, should show the "use the link from email" message
		await expect(page.getByRole('heading', { name: /Manage Preferences/i })).toBeVisible()
		await expect(page.getByText(/use the link from any email/i)).toBeVisible()
	})

	test('should have subscribe link when no token', async ({ page }) => {
		await page.goto('/preferences')
		await page.waitForLoadState('networkidle')

		// Target the subscribe link in the main content area (not navbar)
		const subscribeLink = page.getByRole('main').getByRole('link', { name: /subscribe/i })
		await expect(subscribeLink).toBeVisible()
		await subscribeLink.click()
		await expect(page).toHaveURL(/subscribe/)
	})

	test('should show error state for invalid token', async ({ page }) => {
		await page.goto('/preferences?token=invalid-token-12345')
		await page.waitForLoadState('networkidle')

		// Wait for fetch to complete and show error state
		await page.waitForTimeout(2000)

		// Should show error message or subscribe again link
		const hasError =
			(await page.getByText(/unable to load/i).count()) > 0 ||
			(await page.getByText(/expired/i).count()) > 0 ||
			(await page.getByText(/subscribe again/i).count()) > 0

		expect(hasError).toBeTruthy()
	})
})

test.describe('Preferences page - with valid token', () => {
	// These tests would require a valid token from the API
	// In a real setup, you'd mock the API or have a test account

	test.skip('should show preferences form with valid token', async ({ page }) => {
		// Would need a valid token
		await page.goto('/preferences?token=valid-test-token')
		await expect(page.getByRole('heading', { name: /Email Preferences/i })).toBeVisible()
	})

	test.skip('should show daily readings checkbox', async ({ page }) => {
		await page.goto('/preferences?token=valid-test-token')
		await expect(page.getByText(/Daily Readings/i)).toBeVisible()
	})

	test.skip('should show feast reminders checkbox', async ({ page }) => {
		await page.goto('/preferences?token=valid-test-token')
		await expect(page.getByText(/Feast Reminders/i)).toBeVisible()
	})

	test.skip('should have save button', async ({ page }) => {
		await page.goto('/preferences?token=valid-test-token')
		await expect(page.getByRole('button', { name: /save/i })).toBeVisible()
	})

	test.skip('should have unsubscribe button', async ({ page }) => {
		await page.goto('/preferences?token=valid-test-token')
		await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeVisible()
	})
})
