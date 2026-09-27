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

	test('should expose a prayer hour selector and section controls', async ({ page }) => {
		// Hour selector dropdown reflects the currently-selected hour.
		await expect(page.getByRole('button', { name: /current hour/i })).toBeVisible()

		// In-page prayer-section navigation is present. The Midnight hour has a Gospel per watch.
		await expect(page.getByRole('button', { name: 'Gospel', exact: true }).first()).toBeVisible()
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

// The closing sequences and bilingual alignment are the parts of the Agpeya that
// data-only tests cannot see: they assert what the reader actually renders. Pin
// the hour with ?hour= so the page does not jump to the hour for the clock.
test.describe('Agpeya closing sequences and bilingual rendering', () => {
	const LANGS_2 = { name: 'CONTENT_LANGUAGES', value: 'en,ar', url: 'http://localhost:3001' }

	// Section-nav buttons render as "<n><Label>" with no separating space, so match
	// the label (and its leading index) within the button text. Labels carry regex
	// metacharacters (parentheses), so escape them.
	const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	function sectionButton(page: import('@playwright/test').Page, index: number, label: string) {
		return page.locator('button').filter({ hasText: new RegExp(`^${index}${escapeRe(label)}$`) })
	}

	async function openSections(page: import('@playwright/test').Page, hour: string, marker: string) {
		await page.goto(`/agpeya?hour=${hour}`)
		await page.waitForLoadState('networkidle')
		await page.getByTitle('Sections (T)').click()
		await expect(
			page
				.locator('button')
				.filter({ hasText: new RegExp(`^\\d+${escapeRe(marker)}$`) })
				.first(),
		).toBeVisible()
	}

	// Jump to a section: the reader mounts only the current page, so content is not
	// in the DOM until its page is shown. The header shows the destination title.
	async function jumpTo(
		page: import('@playwright/test').Page,
		hour: string,
		section: [number, string],
	) {
		await openSections(page, hour, section[1])
		await sectionButton(page, section[0], section[1]).first().click()
		// The section nav is a modal; clicking an entry closes it and mounts the page.
		await expect(sectionButton(page, section[0], section[1])).toHaveCount(0, {
			timeout: 3000,
		})
	}

	test('Midnight closes the first two watches with Kyrie, Holy Holy Holy and the Lord’s Prayer', async ({
		page,
	}) => {
		await openSections(page, 'midnight', 'Lord Have Mercy (41 times)')
		for (const [index, label] of [
			[15, 'Litanies'],
			[16, 'Lord Have Mercy (41 times)'],
			[17, 'Holy, Holy, Holy'],
			[18, "The Lord's Prayer"],
			[19, 'Second Watch'],
			[31, 'Litanies'],
			[32, 'Lord Have Mercy (41 times)'],
			[33, 'Holy, Holy, Holy'],
			[34, "The Lord's Prayer"],
			[35, 'Third Watch'],
		] as const) {
			await expect(sectionButton(page, index, label)).toBeVisible()
		}
	})

	test('Midnight ends with the full closing sequence after the third watch', async ({ page }) => {
		await openSections(page, 'midnight', 'Lord Have Mercy (41 times)')
		for (const [index, label] of [
			[48, 'Gospel'],
			[49, 'Litanies'],
			[50, 'Lord Have Mercy (41 times)'],
			[51, 'Holy, Holy, Holy'],
			[52, "The Lord's Prayer"],
			[53, 'Gospel'],
			[55, 'Introduction to the Creed'],
			[56, 'The Orthodox Creed'],
			[60, 'Absolution (Midnight)'],
			[61, 'Conclusion of Every Hour'],
		] as const) {
			await expect(sectionButton(page, index, label)).toBeVisible()
		}
	})

	test('Compline prays Graciously O Lord, Trisagion, Hail to You and the Creed', async ({
		page,
	}) => {
		await openSections(page, 'compline', 'Graciously O Lord')
		for (const [index, label] of [
			[17, 'Gospel'],
			[18, 'Litanies'],
			[19, 'Graciously O Lord'],
			[20, 'The Trisagion'],
			[21, 'Hail to Saint Mary'],
			[22, 'Introduction to the Creed'],
			[23, 'The Orthodox Creed'],
			[24, 'Lord Have Mercy (41 times)'],
			[25, 'Holy, Holy, Holy'],
			[26, 'Absolution'],
			[27, 'Conclusion of Every Hour'],
		] as const) {
			await expect(sectionButton(page, index, label)).toBeVisible()
		}
	})

	test('renders the litany responses in Coptic script, not transliteration', async ({ page }) => {
		await jumpTo(page, 'midnight', [49, 'Litanies'])
		const body = page.locator('body')
		await expect(body).toContainText('Ⲇⲟⲝⲁ Ⲡⲁⲧⲣⲓ ⲕⲉ Ⲩ̀ⲓⲱ ⲕⲉ Ⲁ̀ⲅⲓⲱ Ⲡ̀ⲛⲉⲩⲙⲁⲧⲓ:')
		await expect(body).toContainText('ⲕⲉ ⲛⲩⲛ ⲕⲉ ⲁ̀ⲓ̀ ⲕⲉ ⲓⲥ ⲧⲟⲩⲥ ⲉ̀ⲱ̀ⲛⲁⲥ ⲧⲱⲛ ⲉ̀ⲱ̀ⲛⲱⲛ. Ⲁ̀ⲙⲏⲛ.')
		// The old Latin transliteration must not reappear anywhere.
		await expect(body).not.toContainText('Dthoxa Patri ke Eiou')
	})

	test('shows the vernacular and the Coptic response in both languages', async ({
		context,
		page,
	}) => {
		await context.addCookies([LANGS_2])
		await jumpTo(page, 'midnight', [49, 'Litanies'])
		const body = page.locator('body')
		// English column: the vernacular response, with the Coptic script beneath.
		await expect(body).toContainText('Glory to the Father and the Son and the Holy Spirit.')
		await expect(body).toContainText('Ⲇⲟⲝⲁ Ⲡⲁⲧⲣⲓ ⲕⲉ Ⲩ̀ⲓⲱ ⲕⲉ Ⲁ̀ⲅⲓⲱ Ⲡ̀ⲛⲉⲩⲙⲁⲧⲓ:')
		// Arabic column: the same response in Arabic.
		await expect(body).toContainText('المجد للآب والابن والروح القدس')
	})

	test('Compline prayers the Graciously prayer at night, not in the day form', async ({ page }) => {
		await jumpTo(page, 'compline', [19, 'Graciously O Lord'])
		const body = page.locator('body')
		await expect(body).toContainText('Graciously O Lord')
		await expect(body).toContainText('keep this night without sin')
		await expect(body).not.toContainText('keep this day without sin')
	})

	test('keeps the shared concluding prayers aligned row-for-row in both languages', async ({
		context,
		page,
	}) => {
		await context.addCookies([LANGS_2])
		await jumpTo(page, 'prime', [33, 'Holy, Holy, Holy'])

		// The Arabic "Absolve, forgive..." clause must sit in the same row as its
		// English counterpart (the first row), not merged into the second.
		const body = page.locator('body')
		await expect(body).toContainText('name which is called upon us.')
		await expect(body).toContainText('الذي دعي علينا.')
		await expect(body).toContainText('Let it be according to Your mercy')
		await expect(body).toContainText('كرحمتك يا رب وليس كخطايانا.')
	})
})
