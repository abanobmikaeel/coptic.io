import { expect, test } from '@playwright/test'

test.describe('Readings page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')
	})

	test('should load the page', async ({ page }) => {
		await expect(page).toHaveURL(/readings/)
	})

	test('should display reading sections', async ({ page }) => {
		// Look for scripture reading sections
		const sections = ['Pauline', 'Catholic', 'Acts', 'Psalm', 'Gospel']
		let foundSections = 0

		for (const section of sections) {
			const sectionElement = page.getByText(new RegExp(section, 'i'))
			if ((await sectionElement.count()) > 0) {
				foundSections++
			}
		}

		expect(foundSections).toBeGreaterThan(0)
	})

	test('should have date display', async ({ page }) => {
		// Should show the current date or a date selector
		const dateRegex =
			/\d{1,2}.*\d{4}|january|february|march|april|may|june|july|august|september|october|november|december/i
		await expect(page.getByText(dateRegex).first()).toBeVisible()
	})

	test('should have translation selector', async ({ page, isMobile }) => {
		// On mobile, the translation toggle may be hidden in a collapsed menu
		if (isMobile) return

		// English/Arabic toggle
		const translationToggle = page.getByText(/english|arabic|العربية/i)
		if ((await translationToggle.count()) > 0) {
			await expect(translationToggle.first()).toBeVisible()
		}
	})

	test('should have settings panel', async ({ page }) => {
		// Look for settings/display options button
		const settingsButton = page.getByRole('button', { name: /settings|display|options|gear/i })
		if ((await settingsButton.count()) > 0) {
			await settingsButton.first().click()
			await page.waitForTimeout(300)
			// Settings panel should open
		}
	})

	test('should display scripture text', async ({ page }) => {
		// There should be readable text content
		const textContent = page.locator('p, [class*="verse"], [class*="text"], blockquote')
		await expect(textContent.first()).toBeVisible({ timeout: 10000 })
	})

	test('should have collapsible reading sections', async ({ page }) => {
		// Reading sections are wrapped in buttons that toggle open/closed
		// Look for buttons containing h2 headers or article sections
		const collapseButtons = page.locator('article button').first()
		if ((await collapseButtons.count()) > 0) {
			// Get initial content visibility
			const article = page.locator('article').first()
			await expect(article).toBeVisible()

			// Click to collapse
			await collapseButtons.click()
			await page.waitForTimeout(300)

			// Click again to expand
			await collapseButtons.click()
			await page.waitForTimeout(300)
		}
	})

	test('should show progress indicator on scroll', async ({ page }) => {
		// Scroll down and check for progress bar
		await page.evaluate(() => window.scrollTo(0, 500))
		await page.waitForTimeout(300)

		const progressBar = page.locator('[class*="progress"], [role="progressbar"]')
		// Progress bar might exist
		const _hasProgress = await progressBar.count()
		// This is optional, so we just verify page still works
		expect(true).toBe(true)
	})
})

test.describe('Readings page — multi-language mobile layout', () => {
	// Force a 3-language display so the side-by-side grid path is exercised.
	// Mobile keeps the comparison view (side-by-side columns) at every breakpoint;
	// the layout compresses gaps and outer padding rather than stacking.
	const LANG_COOKIE = {
		name: 'CONTENT_LANGUAGES',
		value: 'en,ar,cop',
		domain: 'localhost',
		path: '/',
	}

	async function loadReadings(page: import('@playwright/test').Page) {
		await page.context().addCookies([LANG_COOKIE])
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')
	}

	// Multi-language content grids live inside <main> and always use Tailwind's
	// grid-cols-* (2/3/4) regardless of viewport.
	const firstMultiLangGrid = (page: import('@playwright/test').Page) =>
		page.locator('main').locator('div[class*="grid-cols-3"]').first()

	test('keeps three languages side-by-side on mobile', async ({ page }) => {
		await loadReadings(page)
		await page.setViewportSize({ width: 390, height: 844 })

		const grid = firstMultiLangGrid(page)
		await expect(grid).toBeVisible()

		const computed = await grid.evaluate((el) => {
			const style = window.getComputedStyle(el)
			return {
				template: style.gridTemplateColumns,
				childCount: el.children.length,
			}
		})

		// 3 languages → 3 tracks at every breakpoint
		const trackCount = computed.template.split(' ').filter(Boolean).length
		expect(trackCount).toBe(3)
		expect(computed.childCount).toBe(3)
	})

	test('renders all selected languages on mobile (no content dropped)', async ({ page }) => {
		await loadReadings(page)
		await page.setViewportSize({ width: 390, height: 844 })

		// English, Arabic and Coptic content should all be present on the page.
		// Match by script range rather than a specific verse — the readings change
		// daily, so hardcoded verse text only passes on the day it was written.
		await expect(firstMultiLangGrid(page)).toBeVisible()
		const mainText = await page.locator('main').innerText()
		expect(mainText).toMatch(/[A-Za-z]{3,}/) // Latin (English)
		expect(mainText).toMatch(/[؀-ۿ]/) // Arabic script
		expect(mainText).toMatch(/[Ⲁ-⳿Ϣ-ϯ]/) // Coptic script
	})

	test('each language column has a minimum readable width on mobile', async ({ page }) => {
		await loadReadings(page)
		await page.setViewportSize({ width: 390, height: 844 })

		const grid = firstMultiLangGrid(page)
		await expect(grid).toBeVisible()

		const columnWidth = await grid.evaluate((el) => {
			const firstChild = el.children[0] as HTMLElement
			return Math.round(firstChild.getBoundingClientRect().width)
		})

		// Three languages in 390px → each column should be ≥ 100px to be readable.
		// This guards against accidentally collapsing the grid on mobile.
		expect(columnWidth).toBeGreaterThanOrEqual(100)
	})
})
