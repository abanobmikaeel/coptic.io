import { expect, test } from '@playwright/test'

test.describe('Calendar subscription options', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')
	})

	test('Google button is one click, with a recovery path when it no-ops', async ({
		page,
		context,
		browserName,
	}) => {
		test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only')
		await context.grantPermissions(['clipboard-read', 'clipboard-write'])

		const link = page.getByRole('link', { name: /add to google calendar/i })
		await expect(link).toBeVisible()

		// One click: the deep link subscribes directly for users Google's regression spares
		const url = new URL((await link.getAttribute('href')) ?? '')
		expect(url.hostname).toBe('calendar.google.com')
		expect(url.pathname).toBe('/calendar/render')
		expect(url.searchParams.get('cid')).toMatch(/^webcal:\/\//)

		// The recovery hint stays hidden until the button is actually used
		await expect(page.getByText(/nothing was added/i)).toBeHidden()

		await link.click({ modifiers: ['Shift'] })

		// Having tried, the user gets the feed on their clipboard and somewhere to paste it
		await expect(page.getByText(/nothing was added/i)).toBeVisible()
		const paste = page.getByRole('link', { name: /paste it here/i })
		expect(new URL((await paste.getAttribute('href')) ?? '').pathname).toBe(
			'/calendar/r/settings/addbyurl',
		)
		expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(
			/^https?:\/\/.*\/calendar\/ical\/subscribe$/,
		)
	})

	test('explains what subscribing does', async ({ page }) => {
		await expect(page.getByText(/keeps the calendar up to date/i)).toBeVisible()
	})

	test('Apple and Outlook link uses the webcal scheme', async ({ page }) => {
		const link = page.getByRole('link', { name: /apple or outlook/i })
		await expect(link).toBeVisible()
		expect(await link.getAttribute('href')).toMatch(/^webcal:\/\/.*\/calendar\/ical\/subscribe$/)
	})

	test('copy button puts the https feed on the clipboard', async ({
		page,
		context,
		browserName,
	}) => {
		// Clipboard permissions are only grantable in Chromium
		test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only')
		await context.grantPermissions(['clipboard-read', 'clipboard-write'])

		const button = page.getByRole('button', { name: /copy feed url/i })
		await expect(button).toBeVisible()
		await button.click()

		// The manual route must be the https feed - no calendar app parses webcal:// by hand
		const copied = await page.evaluate(() => navigator.clipboard.readText())
		expect(copied).toMatch(/^https?:\/\/.*\/calendar\/ical\/subscribe$/)

		await expect(page.getByRole('button', { name: /copied/i })).toBeVisible()
	})
})
