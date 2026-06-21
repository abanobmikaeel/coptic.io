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
		// Branding is the "Coptic IO" logo link in the navbar (scoped so it doesn't
		// match the many other occurrences of "Coptic" in page copy).
		await expect(page.locator('nav').getByRole('link', { name: 'Coptic IO' })).toBeVisible()
	})
})

test.describe('Home page - Desktop', () => {
	test.use({ viewport: { width: 1280, height: 720 } })

	test('should have calendar link in navbar', async ({ page }) => {
		await page.goto('/')

		// Desktop navbar calendar link
		const topNav = page.locator('nav.sticky')
		const calendarLink = topNav.getByRole('link', { name: /calendar/i })

		await expect(calendarLink).toBeVisible()
		await calendarLink.click()
		await expect(page).toHaveURL(/calendar/)
	})

	test('should open the Read dropdown with content links', async ({ page }) => {
		await page.goto('/')

		const readTrigger = page.locator('nav').getByRole('link', { name: 'Read', exact: true })
		await readTrigger.hover()

		// A dropdown item that only exists in the Read menu (not elsewhere on the
		// page) becomes visible, confirming the menu opened.
		await expect(page.locator('nav').getByRole('link', { name: /lent guide/i })).toBeVisible()
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

	// Mobile uses a hamburger "Open menu" button that opens a dialog with the nav
	// links (the old bottom-nav tabs were removed in a UI refactor).
	test('should open menu and show navigation links', async ({ page }) => {
		await page.goto('/')

		await page.getByRole('button', { name: 'Open menu' }).click()
		const menu = page.getByRole('dialog')

		await expect(menu.getByRole('link', { name: /library/i })).toBeVisible()
		await expect(menu.getByRole('link', { name: /calendar/i })).toBeVisible()
	})

	test('should navigate to library from menu', async ({ page }) => {
		await page.goto('/')

		await page.getByRole('button', { name: 'Open menu' }).click()
		await page
			.getByRole('dialog')
			.getByRole('link', { name: /library/i })
			.click()

		await expect(page).toHaveURL(/library/)
	})

	test('should navigate to calendar from menu', async ({ page }) => {
		await page.goto('/')

		await page.getByRole('button', { name: 'Open menu' }).click()
		await page
			.getByRole('dialog')
			.getByRole('link', { name: /calendar/i })
			.click()

		await expect(page).toHaveURL(/calendar/)
	})
})
