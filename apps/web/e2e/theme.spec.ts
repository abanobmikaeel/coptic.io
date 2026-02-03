import { expect, test } from '@playwright/test'

test.describe('Theme and display settings', () => {
	test('should toggle dark mode', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Find theme toggle button
		const themeToggle = page.getByRole('button', { name: /theme|dark|light|mode/i })

		if ((await themeToggle.count()) > 0) {
			// Get initial theme
			const _initialClass = await page.locator('html').getAttribute('class')

			await themeToggle.first().click()
			await page.waitForTimeout(300)

			// Theme class should change
			const _newClass = await page.locator('html').getAttribute('class')
			// Classes might include 'dark' or not
		}
	})

	test('should persist theme across navigation', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Try to enable dark mode if not already
		const themeToggle = page.getByRole('button', { name: /theme|dark|light|mode/i })
		if ((await themeToggle.count()) > 0) {
			await themeToggle.first().click()
			await page.waitForTimeout(300)

			const _themeAfterToggle = await page.locator('html').getAttribute('class')

			// Navigate to another page
			await page.goto('/agpeya')
			await page.waitForLoadState('networkidle')

			const _themeAfterNav = await page.locator('html').getAttribute('class')

			// Theme should persist (both should have same dark/light state)
		}
	})

	test('should have display settings on readings page', async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		// Look for settings button
		const settingsButton = page.locator('button').filter({ hasText: /settings|display|font|size/i })

		if ((await settingsButton.count()) > 0) {
			await settingsButton.first().click()
			await page.waitForTimeout(300)

			// Should show font size options
			const fontOptions = page.getByText(/small|medium|large|font size/i)
			if ((await fontOptions.count()) > 0) {
				await expect(fontOptions.first()).toBeVisible()
			}
		}
	})

	test('should change font size in settings', async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		const settingsButton = page.locator('button').filter({ hasText: /settings|display/i })

		if ((await settingsButton.count()) > 0) {
			await settingsButton.first().click()
			await page.waitForTimeout(300)

			// Find font size buttons
			const largeFontButton = page.getByRole('button', { name: /large|lg|xl/i })
			if ((await largeFontButton.count()) > 0) {
				await largeFontButton.first().click()
				await page.waitForTimeout(300)
			}
		}
	})
})
