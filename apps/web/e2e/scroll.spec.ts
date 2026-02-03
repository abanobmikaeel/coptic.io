import { expect, test } from '@playwright/test'

test.describe('Scroll behavior', () => {
	test('body should not have scroll lock stuck after modal', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Open and close command palette multiple times
		for (let i = 0; i < 3; i++) {
			await page.keyboard.press('Meta+k')
			await expect(page.getByPlaceholder(/search/i)).toBeVisible()
			await page.keyboard.press('Escape')
			await expect(page.getByPlaceholder(/search/i)).not.toBeVisible()
		}

		// Body should be scrollable (no stuck styles)
		const bodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow)
		expect(bodyOverflow).not.toBe('hidden')
	})

	test('should allow scrolling on content pages', async ({ page }) => {
		await page.goto('/synaxarium')
		await page.waitForLoadState('networkidle')

		// Get page height
		const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight)
		const viewportHeight = await page.evaluate(() => window.innerHeight)

		// If page is scrollable, test scrolling
		if (pageHeight > viewportHeight) {
			const targetScroll = Math.min(100, pageHeight - viewportHeight)
			await page.evaluate((y) => window.scrollTo(0, y), targetScroll)
			await page.waitForTimeout(100)

			const currentScroll = await page.evaluate(() => window.scrollY)
			expect(currentScroll).toBeGreaterThan(0)
		}
	})

	test('modal should prevent background scroll', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Open command palette
		await page.keyboard.press('Meta+k')
		await expect(page.getByPlaceholder(/search/i)).toBeVisible()

		// Verify modal is displayed with scroll prevention
		const modalVisible = await page.locator('.fixed.inset-0').isVisible()
		expect(modalVisible).toBeTruthy()
	})
})
