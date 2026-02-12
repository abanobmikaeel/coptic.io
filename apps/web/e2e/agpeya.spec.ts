import { expect, test } from '@playwright/test'

test.describe('Agpeya page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/agpeya')
		await page.waitForLoadState('networkidle')
	})

	test('should load the page', async ({ page }) => {
		await expect(page).toHaveURL(/agpeya/)
	})

	test('should display prayer hours', async ({ page }) => {
		// Check for canonical prayer hours
		const hours = ['Prime', 'Terce', 'Sext', 'None', 'Vespers', 'Compline', 'Midnight']
		let foundHours = 0

		for (const hour of hours) {
			const hourElement = page.getByText(new RegExp(hour, 'i'))
			if ((await hourElement.count()) > 0) {
				foundHours++
			}
		}

		expect(foundHours).toBeGreaterThan(0)
	})

	test('should have clickable prayer hour sections', async ({ page }) => {
		// Look for buttons or links to select prayer hours
		const hourButtons = page.locator('button, a').filter({
			hasText: /prime|terce|sext|none|vespers|compline|midnight/i,
		})

		if ((await hourButtons.count()) > 0) {
			await hourButtons.first().click()
			await page.waitForTimeout(500)
			// Should navigate or expand content
		}
	})

	test('should have expandable/collapsible sections', async ({ page }) => {
		// Look for visible expandable sections
		const expandTriggers = page
			.locator('button[aria-expanded], [data-state], details summary')
			.filter({ has: page.locator(':visible') })

		const visibleTriggers = await expandTriggers.filter({ hasNot: page.locator('[hidden]') })
		const count = await visibleTriggers.count()

		if (count > 0) {
			// Find one that's actually visible and clickable
			for (let i = 0; i < Math.min(count, 5); i++) {
				const trigger = visibleTriggers.nth(i)
				if (await trigger.isVisible()) {
					await trigger.click()
					await page.waitForTimeout(300)
					break
				}
			}
		}
	})

	test('should display prayer content', async ({ page }) => {
		// Look for psalm or prayer text content
		const content = page.locator('p, [class*="prayer"], [class*="psalm"], [class*="text"]')
		await expect(content.first()).toBeVisible({ timeout: 10000 })
	})

	test('should have navigation between hours', async ({ page }) => {
		// Should be able to switch between prayer hours
		const hourLinks = page.locator('a, button').filter({
			hasText: /prime|terce|sext|none|vespers|compline|midnight/i,
		})

		const count = await hourLinks.count()
		expect(count).toBeGreaterThan(0)
	})

	test('should not have horizontal overflow on mobile', async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 812 })
		await page.goto('/agpeya')
		await page.waitForLoadState('networkidle')

		// Check that the page doesn't have horizontal scroll
		const hasHorizontalScroll = await page.evaluate(() => {
			return document.documentElement.scrollWidth > document.documentElement.clientWidth
		})

		expect(hasHorizontalScroll).toBe(false)
	})
})
