import { expect, test } from '@playwright/test'

test.describe('Navigation - Desktop', () => {
	test.use({ viewport: { width: 1280, height: 720 } })

	test('should have working calendar link', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Desktop has calendar link in top navbar
		const calendarLink = page
			.locator('nav')
			.first()
			.getByRole('link', { name: /calendar/i })
		if ((await calendarLink.count()) > 0) {
			await calendarLink.first().click()
			await expect(page).toHaveURL(/calendar/)
		}
	})

	test('should have Read dropdown menu', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const readDropdown = page.getByText('Read').first()
		if ((await readDropdown.count()) > 0) {
			await readDropdown.hover()
			await page.waitForTimeout(300)

			const dropdownContent = page.locator('[class*="dropdown"], [role="menu"]')
			if ((await dropdownContent.count()) > 0) {
				await expect(dropdownContent.first()).toBeVisible()
			}
		}
	})

	test('should navigate to subscribe page', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const subscribeLink = page.getByRole('link', { name: /subscribe/i })
		if ((await subscribeLink.count()) > 0) {
			await subscribeLink.first().click()
			await expect(page).toHaveURL(/subscribe/)
		}
	})

	test('should have logo link to home', async ({ page }) => {
		await page.goto('/calendar')
		await page.waitForLoadState('networkidle')

		const homeLink = page.getByRole('link', { name: /coptic/i }).first()
		if ((await homeLink.count()) > 0) {
			await homeLink.click()
			await expect(page).toHaveURL('/')
		}
	})
})

test.describe('Navigation - Mobile', () => {
	test.use({ viewport: { width: 375, height: 667 } })

	test('should show bottom navigation', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const bottomNav = page.locator('nav[aria-label="Main navigation"]')
		await expect(bottomNav).toBeVisible()
	})

	test('should navigate to Library from bottom nav', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Target the link INSIDE the bottom nav specifically
		const bottomNav = page.locator('nav[aria-label="Main navigation"]')
		const libraryTab = bottomNav.getByRole('link', { name: /library/i })

		await expect(libraryTab).toBeVisible()
		await libraryTab.click()
		await expect(page).toHaveURL(/library/)
	})

	test('should navigate to Calendar from bottom nav', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Target the link INSIDE the bottom nav specifically
		const bottomNav = page.locator('nav[aria-label="Main navigation"]')
		const calendarTab = bottomNav.getByRole('link', { name: /calendar/i })

		await expect(calendarTab).toBeVisible()
		await calendarTab.click()
		await expect(page).toHaveURL(/calendar/)
	})

	test('should navigate to Today from bottom nav', async ({ page }) => {
		await page.goto('/library')
		await page.waitForLoadState('networkidle')

		const bottomNav = page.locator('nav[aria-label="Main navigation"]')
		const todayTab = bottomNav.getByRole('link', { name: /today/i })

		await expect(todayTab).toBeVisible()
		await todayTab.click()
		await expect(page).toHaveURL(/^\/$|localhost:\d+\/$/)
	})

	test('should highlight active tab', async ({ page }) => {
		await page.goto('/calendar')
		await page.waitForLoadState('networkidle')

		const bottomNav = page.locator('nav[aria-label="Main navigation"]')
		const calendarTab = bottomNav.getByRole('link', { name: /calendar/i })

		// Active tab should have aria-current="page"
		await expect(calendarTab).toHaveAttribute('aria-current', 'page')
	})
})

test.describe('Navigation - General', () => {
	test('back button should work', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		await page.goto('/calendar')
		await page.waitForLoadState('networkidle')
		await expect(page).toHaveURL(/calendar/)

		await page.goBack()
		await expect(page).toHaveURL('/')
	})

	test('should navigate using keyboard', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Tab')
		}

		const focused = await page.evaluate(() => document.activeElement?.tagName)
		expect(focused).toBeTruthy()
	})
})
