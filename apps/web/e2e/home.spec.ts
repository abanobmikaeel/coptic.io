import { expect, test } from '@playwright/test'

test.describe('Home page', () => {
	test('should load successfully', async ({ page }) => {
		await page.goto('/')
		await expect(page).toHaveTitle(/Coptic/)
	})

	test('should have navigation', async ({ page }) => {
		await page.goto('/')
		await expect(page.getByRole('navigation').first()).toBeVisible()
	})

	test('should have branding', async ({ page }) => {
		await page.goto('/')
		await expect(page.getByText(/Coptic/i).first()).toBeVisible()
	})
})

test.describe('Home page - Desktop', () => {
	test.use({ viewport: { width: 1280, height: 720 } })

	test('should have calendar link in navbar', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Desktop navbar calendar link
		const topNav = page.locator('nav.sticky')
		const calendarLink = topNav.getByRole('link', { name: /calendar/i })

		await expect(calendarLink).toBeVisible()
		await calendarLink.click()
		await expect(page).toHaveURL(/calendar/)
	})

	test('should have Read dropdown with content links', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const readDropdown = page.getByText('Read')
		if ((await readDropdown.count()) > 0) {
			await readDropdown.first().hover()
			await page.waitForTimeout(300)

			// Should show dropdown items
			const agpeyaLink = page.getByText(/Agpeya/i)
			const synaxariumLink = page.getByText(/Synaxarium/i)

			const hasDropdownItems = (await agpeyaLink.count()) > 0 || (await synaxariumLink.count()) > 0
			expect(hasDropdownItems).toBeTruthy()
		}
	})

	test('should navigate to subscribe page', async ({ page }) => {
		await page.goto('/')
		const subscribeLink = page.getByRole('link', { name: /subscribe/i })
		if ((await subscribeLink.count()) > 0) {
			await subscribeLink.first().click()
			await expect(page).toHaveURL(/subscribe/)
		}
	})
})

test.describe('Home page - Mobile', () => {
	test.use({ viewport: { width: 375, height: 667 } })

	test('should have bottom navigation tabs', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const bottomNav = page.locator('nav[aria-label="Main navigation"]')
		await expect(bottomNav).toBeVisible()

		// Should have Today, Library, Calendar tabs
		await expect(bottomNav.getByText('Today')).toBeVisible()
		await expect(bottomNav.getByText('Library')).toBeVisible()
		await expect(bottomNav.getByText('Calendar')).toBeVisible()
	})

	test('should navigate to library from bottom nav', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const bottomNav = page.locator('nav[aria-label="Main navigation"]')
		await bottomNav.getByRole('link', { name: /library/i }).click()
		await expect(page).toHaveURL(/library/)
	})

	test('should navigate to calendar from bottom nav', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const bottomNav = page.locator('nav[aria-label="Main navigation"]')
		await bottomNav.getByRole('link', { name: /calendar/i }).click()
		await expect(page).toHaveURL(/calendar/)
	})
})
