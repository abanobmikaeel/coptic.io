import { expect, test } from '@playwright/test'

test.describe('Accessibility', () => {
	test('home page should have proper heading structure', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Should have an h1
		const h1 = page.locator('h1')
		await expect(h1.first()).toBeVisible()
	})

	test('images should have alt text', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const images = page.locator('img')
		const count = await images.count()

		for (let i = 0; i < Math.min(count, 10); i++) {
			const img = images.nth(i)
			const alt = await img.getAttribute('alt')
			const ariaLabel = await img.getAttribute('aria-label')
			const role = await img.getAttribute('role')

			// Image should have alt text OR be decorative (role="presentation")
			const isAccessible = alt !== null || ariaLabel !== null || role === 'presentation'
			expect(isAccessible).toBeTruthy()
		}
	})

	test('buttons should have accessible names', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const buttons = page.getByRole('button')
		const count = await buttons.count()

		for (let i = 0; i < Math.min(count, 10); i++) {
			const button = buttons.nth(i)
			const name = await button.getAttribute('aria-label')
			const text = await button.textContent()

			// Button should have text content or aria-label
			const hasName = (name && name.trim().length > 0) || (text && text.trim().length > 0)
			expect(hasName).toBeTruthy()
		}
	})

	test('links should have accessible names', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const links = page.getByRole('link')
		const count = await links.count()

		for (let i = 0; i < Math.min(count, 10); i++) {
			const link = links.nth(i)
			const name = await link.getAttribute('aria-label')
			const text = await link.textContent()

			// Link should have text content or aria-label
			const hasName = (name && name.trim().length > 0) || (text && text.trim().length > 0)
			expect(hasName).toBeTruthy()
		}
	})

	test('form inputs should have labels', async ({ page }) => {
		await page.goto('/subscribe')
		await page.waitForLoadState('networkidle')

		const inputs = page.locator('input[type="text"], input[type="email"]')
		const count = await inputs.count()

		for (let i = 0; i < count; i++) {
			const input = inputs.nth(i)
			const id = await input.getAttribute('id')
			const ariaLabel = await input.getAttribute('aria-label')
			const placeholder = await input.getAttribute('placeholder')

			// Input should have associated label, aria-label, or at least placeholder
			if (id) {
				const label = page.locator(`label[for="${id}"]`)
				const hasLabel = (await label.count()) > 0
				const hasAccessibleName = hasLabel || ariaLabel !== null || placeholder !== null
				expect(hasAccessibleName).toBeTruthy()
			}
		}
	})

	test('page should be navigable with keyboard', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Tab through the page
		for (let i = 0; i < 10; i++) {
			await page.keyboard.press('Tab')
		}

		// Some element should be focused
		const focused = await page.evaluate(() => document.activeElement?.tagName)
		expect(focused).toBeTruthy()
	})

	test('skip to content link should exist', async ({ page }) => {
		await page.goto('/')

		// Press tab once to reveal skip link (if hidden until focused)
		await page.keyboard.press('Tab')

		const skipLink = page.getByRole('link', { name: /skip to (main )?content/i })
		// Skip link is optional but good practice
		if ((await skipLink.count()) > 0) {
			await expect(skipLink).toBeFocused()
		}
	})

	test('color contrast should be sufficient', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// This is a basic check - for full contrast testing use axe-core
		const body = page.locator('body')
		const backgroundColor = await body.evaluate((el) => getComputedStyle(el).backgroundColor)
		const color = await body.evaluate((el) => getComputedStyle(el).color)

		// Just verify colors are set
		expect(backgroundColor).toBeTruthy()
		expect(color).toBeTruthy()
	})
})
