import { expect, test } from '@playwright/test'

test.describe('Tasbeha page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/tasbeha')
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
		await page.goto('/tasbeha')
		await expect(
			page.getByText('Arise O children of the light, let us praise the Lord of hosts.').first(),
		).toBeVisible()
		await expect(page.getByText('قوموا يا بني النور، لنسبح رب القوات.').first()).toBeVisible()
	})

	test('aligns Coptic with the English and Arabic stanzas', async ({ context, page }) => {
		await context.addCookies([
			{ name: 'CONTENT_LANGUAGES', value: 'en,cop,ar', url: 'http://localhost:3001' },
		])
		await page.goto('/tasbeha')
		await expect(
			page.getByText('Ⲧⲉⲛⲑⲏⲛⲟⲩ ⲉ̀ⲡ̀ϣⲱⲓ ⲛⲓϣⲏⲣⲓ ⲛ̀ⲧⲉ ⲡⲓⲟⲩⲱⲓⲛⲓ: ⲛ̀ⲧⲉⲛϩⲱⲥ ⲉ̀Ⲡ̀ϭⲟⲓⲥ ⲛ̀ⲧⲉ ⲛⲓϫⲟⲙ.').first(),
		).toBeVisible()
		await expect(page.locator('p').filter({ hasText: /^Coptic$/ })).toBeVisible()
	})

	test('does not overflow on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 })
		await page.goto('/tasbeha')
		await expect
			.poll(() =>
				page.evaluate(
					() => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
				),
			)
			.toBe(true)
	})
})
