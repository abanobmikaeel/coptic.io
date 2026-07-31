import { expect, test } from '@playwright/test'

// Bare /tasbeha resolves to whichever day it actually is, so every assertion about
// specific content pins ?day= to stay deterministic.
const SUNDAY = '/tasbeha?day=sunday'

test.describe('Tasbeha page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(SUNDAY)
		await page.waitForLoadState('networkidle')
	})

	test('renders the annual Sunday/Adam reader', async ({ page }) => {
		await expect(page).toHaveURL(/tasbeha/)
		await expect(page.getByText('Annual · Sunday (Adam)')).toBeVisible()
		await expect(page.getByRole('heading', { name: 'Ten-theno', exact: true })).toBeVisible()
	})

	test('keeps Ten-theno in two-line presentation pairs', async ({ page }) => {
		await expect(
			page.getByText('Arise O children of the light, let us praise the Lord of hosts.').first(),
		).toBeVisible()
		await expect(
			page.getByText('That He may grant us the salvation of our souls.').first(),
		).toBeVisible()
		await expect(
			page.getByText('Whenever we stand before You in the flesh.').first(),
		).not.toBeVisible()
	})

	test('exposes the imported sections without response markers', async ({ page }) => {
		await page.getByTitle('Sections (T)').click()
		await expect(page.getByRole('button', { name: /^\d+\s+The First Hoos$/ })).toBeVisible()
		await expect(
			page.getByRole('button', { name: /^\d+\s+The Gospel According to Saint Luke$/ }),
		).toBeVisible()
		await expect(
			page.getByRole('button', { name: /^\d+\s+Sunday Theotokia — Part 15/ }),
		).toBeVisible()
		await expect(page.getByRole('button', { name: /^\d+\s+The Concluding Litany$/ })).toBeVisible()
		await expect(page.getByText(/^\s*\+/)).toHaveCount(0)
	})

	test('aligns English and Arabic content', async ({ context, page }) => {
		await context.addCookies([
			{ name: 'CONTENT_LANGUAGES', value: 'en,ar', url: 'http://localhost:3001' },
		])
		await page.goto(SUNDAY)
		await expect(
			page.getByText('Arise O children of the light, let us praise the Lord of hosts.').first(),
		).toBeVisible()
		await expect(page.getByText('قوموا يا بني النور، لنسبح رب القوات.').first()).toBeVisible()
	})

	test('aligns Coptic with the English and Arabic stanzas', async ({ context, page }) => {
		await context.addCookies([
			{ name: 'CONTENT_LANGUAGES', value: 'en,cop,ar', url: 'http://localhost:3001' },
		])
		await page.goto(SUNDAY)
		await expect(
			page.getByText('Ⲧⲉⲛⲑⲏⲛⲟⲩ ⲉ̀ⲡ̀ϣⲱⲓ ⲛⲓϣⲏⲣⲓ ⲛ̀ⲧⲉ ⲡⲓⲟⲩⲱⲓⲛⲓ: ⲛ̀ⲧⲉⲛϩⲱⲥ ⲉ̀Ⲡ̀ϭⲟⲓⲥ ⲛ̀ⲧⲉ ⲛⲓϫⲟⲙ.').first(),
		).toBeVisible()
		await expect(page.locator('p').filter({ hasText: /^Coptic$/ })).toBeVisible()
	})

	test('does not overflow on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 })
		await page.goto(SUNDAY)
		await expect
			.poll(() =>
				page.evaluate(
					() => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
				),
			)
			.toBe(true)
	})
})

test.describe('Tasbeha day switching', () => {
	test('defaults to the service prayed today', async ({ page }) => {
		await page.goto('/tasbeha')
		await page.waitForLoadState('networkidle')
		const days = [
			'Sunday',
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday',
		] as const
		const today = days[new Date().getDay()]
		await expect(page.getByText(new RegExp(`Annual · ${today}`))).toBeVisible()
	})

	test('switches to a weekday and swaps in its proper Theotokia', async ({ page }) => {
		await page.goto('/tasbeha?day=wednesday')
		await page.waitForLoadState('networkidle')

		await expect(page.getByText('Annual · Wednesday (Watos)')).toBeVisible()
		await page.getByTitle('Sections (T)').click()
		await expect(
			page.getByRole('button', { name: /^\d+\s+The Wednesday Theotokia — Watos$/ }),
		).toBeVisible()
		await expect(page.getByRole('button', { name: /^\d+\s+The Wednesday Psali$/ })).toBeVisible()
		// The Sunday propers must not leak into a weekday service.
		await expect(page.getByRole('button', { name: /The First Sunday Psali/ })).toHaveCount(0)
	})

	test('presents Saturday as the Vespers Praise', async ({ page }) => {
		await page.goto('/tasbeha?day=saturday')
		await page.waitForLoadState('networkidle')

		await expect(page.getByText('Annual · Saturday Vespers (Watos)')).toBeVisible()
		await page.getByTitle('Sections (T)').click()
		await expect(
			page.getByRole('button', { name: /^\d+\s+The Saturday Theotokia Lobsh — The Sherat$/ }),
		).toBeVisible()
		// A Vespers Praise has no morning doxology and no Ten-theno.
		await expect(page.getByRole('button', { name: /The Morning Doxology/ })).toHaveCount(0)
		await expect(page.getByRole('button', { name: /Ten-theno/ })).toHaveCount(0)
	})

	test('changes day through the header switcher and keeps reader settings', async ({ page }) => {
		await page.goto('/tasbeha?day=sunday&theme=dark')
		await page.waitForLoadState('networkidle')

		await page
			.getByRole('button', { name: /Sunday/ })
			.first()
			.click()
		await page
			.getByRole('button', { name: /Thursday/ })
			.first()
			.click()

		await expect(page).toHaveURL(/day=thursday/)
		await expect(page).toHaveURL(/theme=dark/)
		await expect(page.getByText('Annual · Thursday (Watos)')).toBeVisible()
	})

	test('falls back to today when the day is unrecognised', async ({ page }) => {
		await page.goto('/tasbeha?day=octoday')
		await page.waitForLoadState('networkidle')
		await expect(page.getByText(/Annual · /)).toBeVisible()
	})
})
