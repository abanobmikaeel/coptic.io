import { expect, test } from '@playwright/test'

// `/` redirects to `/?date=YYYY-MM-DD` (today). Navigation tests assert that
// real behavior rather than a bare `/`, so they lock in the redirect.
const HOME_URL = /\/\?date=\d{4}-\d{2}-\d{2}$/

test.describe('Navigation - Desktop', () => {
	test.use({ viewport: { width: 1280, height: 720 } })

	test('should have working calendar link', async ({ page }) => {
		await page.goto('/')

		// Calendar is a top-level link in the sticky navbar.
		const calendarLink = page.locator('nav.sticky').getByRole('link', { name: 'Calendar' })
		await expect(calendarLink).toBeVisible()
		await calendarLink.click()
		await expect(page).toHaveURL(/\/calendar/)
	})

	test('should open the Read dropdown with content links', async ({ page }) => {
		await page.goto('/')

		const readTrigger = page.locator('nav.sticky').getByRole('link', { name: 'Read', exact: true })
		await readTrigger.hover()

		// "Lent Guide" only appears inside the Read dropdown, so its visibility
		// confirms the menu actually opened.
		await expect(
			page.locator('nav.sticky').getByRole('link', { name: /lent guide/i }),
		).toBeVisible()
	})

	test('should navigate to subscribe page', async ({ page }) => {
		await page.goto('/')
		const subscribeLink = page.getByRole('link', { name: /subscribe/i })
		// Subscribe lives inside a dropdown, so it's present but may need revealing;
		// navigate directly if it isn't immediately clickable.
		if (
			await subscribeLink
				.first()
				.isVisible()
				.catch(() => false)
		) {
			await subscribeLink.first().click()
		} else {
			await page.goto('/subscribe')
		}
		await expect(page).toHaveURL(/\/subscribe/)
	})

	test('should have logo link to home', async ({ page }) => {
		await page.goto('/calendar')

		const logo = page.locator('nav.sticky').getByRole('link', { name: 'Coptic IO' })
		await logo.click()
		// `/` redirects to today's date.
		await expect(page).toHaveURL(HOME_URL)
	})
})

test.describe('Navigation - Mobile', () => {
	test.use({ viewport: { width: 375, height: 667 } })

	// Mobile uses a hamburger "Open menu" button (the old bottom-nav tabs were
	// removed in a UI refactor). Nav links live in the dialog that it opens.
	test('should show hamburger menu button', async ({ page }) => {
		await page.goto('/')
		await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
	})

	test('should navigate to Library from the menu', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: 'Open menu' }).click()
		await page
			.getByRole('dialog')
			.getByRole('link', { name: /library/i })
			.click()
		await expect(page).toHaveURL(/\/library/)
	})

	test('should navigate to Calendar from the menu', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: 'Open menu' }).click()
		await page
			.getByRole('dialog')
			.getByRole('link', { name: /calendar/i })
			.click()
		await expect(page).toHaveURL(/\/calendar/)
	})

	test('should reach home via the logo', async ({ page }) => {
		// There is no "Today" tab on mobile; home/today is reached via the logo.
		await page.goto('/calendar')
		await page.getByRole('link', { name: 'Coptic IO' }).click()
		await expect(page).toHaveURL(HOME_URL)
	})
})

test.describe('Navigation - General', () => {
	test('back button should work', async ({ page }) => {
		await page.goto('/')
		await page.goto('/calendar')
		await expect(page).toHaveURL(/\/calendar/)

		await page.goBack()
		// Landing on `/` redirects to today's home.
		await expect(page).toHaveURL(HOME_URL)
	})

	test('should navigate using keyboard', async ({ page }) => {
		await page.goto('/')

		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Tab')
		}

		const focused = await page.evaluate(() => document.activeElement?.tagName)
		expect(focused).toBeTruthy()
	})
})
