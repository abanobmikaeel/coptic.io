/**
 * Regression tests for 4 UX bugs fixed in fix/emails+navbar:
 *
 * 1. Language cookie respected — lent page shows only selected language content
 * 2. Lent header layout — "All Days" and "Display languages" (Aa) buttons never overlap
 * 3. Theme cookie drives SSR — dark/sepia backgrounds applied on first render
 * 4. Settings panel is theme-aware — panel background matches reading theme
 *
 * Requires dev servers running locally:
 *   Web: PORT=3001 pnpm dev   (apps/web)
 *   API: pnpm dev             (apps/api, port 3000)
 */

import { type Page, expect, test } from '@playwright/test'

// Day 41 of Great Lent 2026 — confirmed to have content (Mark 10:46-52)
const LENT_DATE = '2026-03-28'
const LENT_URL = `/lent/${LENT_DATE}`
const STORAGE_KEY = 'coptic-reading-preferences'

// ─── helpers ───────────────────────────────────────────────────────────────

/** Set cookies before navigating. Clears all existing cookies first for isolation. */
async function withCookies(page: Page, cookies: Array<{ name: string; value: string }>) {
	await page.context().clearCookies()
	await page.context().addCookies(
		cookies.map((c) => ({
			...c,
			domain: 'localhost',
			path: '/',
		})),
	)
}

/**
 * Seed localStorage with reading preferences before the page loads.
 * Must be called before page.goto().
 */
async function withLocalPrefs(page: Page, prefs: Record<string, string>) {
	await page.addInitScript(
		({ key, value }) => {
			localStorage.setItem(key, value)
		},
		{ key: STORAGE_KEY, value: JSON.stringify(prefs) },
	)
}

/** Returns the CSS class attribute of the page's <main> element. */
async function getMainClasses(page: Page) {
	return page.locator('main').first().getAttribute('class')
}

// ─── Bug 1: Language filtering via cookie ──────────────────────────────────

test.describe('Bug 1: Language cookie filtering on lent page', () => {
	test.use({ viewport: { width: 1280, height: 800 } })

	test('shows only English when CONTENT_LANGUAGES=en', async ({ page }) => {
		await withCookies(page, [{ name: 'CONTENT_LANGUAGES', value: 'en' }])
		await page.goto(LENT_URL)
		await page.waitForLoadState('networkidle')

		// Arabic scripture content uses RTL direction containers
		const rtlElements = page.locator('[dir="rtl"]')
		await expect(rtlElements).toHaveCount(0)
	})

	test('shows Arabic alongside English when CONTENT_LANGUAGES=en,ar', async ({ page }) => {
		await withCookies(page, [{ name: 'CONTENT_LANGUAGES', value: 'en,ar' }])
		await page.goto(LENT_URL)
		await page.waitForLoadState('networkidle')

		// Arabic scripture content should appear in RTL direction containers
		const rtlElements = page.locator('[dir="rtl"]')
		await expect(rtlElements).not.toHaveCount(0)
	})
})

// ─── Bug 1 (readings page): Language filtering via cookie ──────────────────

test.describe('Bug 1: Language cookie filtering on readings page', () => {
	test.use({ viewport: { width: 1280, height: 800 } })

	test('shows only English when CONTENT_LANGUAGES=en', async ({ page }) => {
		await withCookies(page, [{ name: 'CONTENT_LANGUAGES', value: 'en' }])
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		const rtlElements = page.locator('[dir="rtl"]')
		await expect(rtlElements).toHaveCount(0)
	})

	test('shows Arabic alongside English when CONTENT_LANGUAGES=en,ar', async ({ page }) => {
		await withCookies(page, [{ name: 'CONTENT_LANGUAGES', value: 'en,ar' }])
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		const rtlElements = page.locator('[dir="rtl"]')
		await expect(rtlElements).not.toHaveCount(0)
	})
})

// ─── Bug 2: No overlap between "All Days" and "Aa" button ──────────────────

test.describe('Bug 2: Lent header layout — no element overlap', () => {
	test('All Days link and Display languages button do not overlap on desktop', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 })
		await page.goto(LENT_URL)
		await page.waitForLoadState('networkidle')

		// Use exact name to avoid matching "View All Days" at the bottom of the page
		const allDaysLink = page.getByRole('link', { name: 'All Days', exact: true })
		const settingsButton = page.getByRole('button', { name: 'Display languages' })

		await expect(allDaysLink).toBeVisible()
		await expect(settingsButton).toBeVisible()

		const allDaysBox = await allDaysLink.boundingBox()
		const settingsBox = await settingsButton.boundingBox()

		expect(allDaysBox).not.toBeNull()
		expect(settingsBox).not.toBeNull()

		if (allDaysBox && settingsBox) {
			// "All Days" must end before the settings button begins
			const allDaysRight = allDaysBox.x + allDaysBox.width
			const settingsLeft = settingsBox.x
			expect(allDaysRight).toBeLessThanOrEqual(settingsLeft)
		}
	})

	test('All Days link and Display languages button are both visible on mobile', async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 })
		await page.goto(LENT_URL)
		await page.waitForLoadState('networkidle')

		const allDaysLink = page.getByRole('link', { name: 'All Days', exact: true })
		const settingsButton = page.getByRole('button', { name: 'Display languages' })

		await expect(allDaysLink).toBeVisible()
		await expect(settingsButton).toBeVisible()

		const allDaysBox = await allDaysLink.boundingBox()
		const settingsBox = await settingsButton.boundingBox()

		expect(allDaysBox).not.toBeNull()
		expect(settingsBox).not.toBeNull()

		if (allDaysBox && settingsBox) {
			// Neither element should overlap the other horizontally
			const allDaysRight = allDaysBox.x + allDaysBox.width
			const settingsRight = settingsBox.x + settingsBox.width
			const noOverlap = allDaysRight <= settingsBox.x || settingsRight <= allDaysBox.x
			expect(noOverlap).toBe(true)
		}
	})
})

// ─── Bug 3: Theme cookie drives SSR background ─────────────────────────────
//
// The cookie is read server-side; localStorage is read client-side.
// We set both so the server and client agree on the theme and there's no
// post-hydration flash back to light.

test.describe('Bug 3: Theme cookie sets correct page background on SSR', () => {
	test.use({ viewport: { width: 1280, height: 800 } })

	test('light theme: page background has bg-gray-50 class', async ({ page }) => {
		await withLocalPrefs(page, { theme: 'light' })
		await withCookies(page, [{ name: 'READING_THEME', value: 'light' }])
		await page.goto(LENT_URL)
		await page.waitForLoadState('networkidle')

		const classes = await getMainClasses(page)
		expect(classes).toContain('bg-gray-50')
	})

	test('dark theme: page background has bg-gray-900 class', async ({ page }) => {
		await withLocalPrefs(page, { theme: 'dark' })
		await withCookies(page, [{ name: 'READING_THEME', value: 'dark' }])
		await page.goto(LENT_URL)
		await page.waitForLoadState('networkidle')

		const classes = await getMainClasses(page)
		expect(classes).toContain('bg-gray-900')
	})

	test('sepia theme: page background has bg-[#f5f0e6] class', async ({ page }) => {
		await withLocalPrefs(page, { theme: 'sepia' })
		await withCookies(page, [{ name: 'READING_THEME', value: 'sepia' }])
		await page.goto(LENT_URL)
		await page.waitForLoadState('networkidle')

		const classes = await getMainClasses(page)
		expect(classes).toContain('bg-[#f5f0e6]')
	})

	test('sepia theme: page background does NOT have bg-gray-50 (sepia not falling back to light)', async ({
		page,
	}) => {
		await withLocalPrefs(page, { theme: 'sepia' })
		await withCookies(page, [{ name: 'READING_THEME', value: 'sepia' }])
		await page.goto(LENT_URL)
		await page.waitForLoadState('networkidle')

		const classes = await getMainClasses(page)
		// Sepia must not render as light (this was the pre-fix behavior)
		expect(classes).not.toContain('bg-gray-50')
	})
})

// ─── Bug 3 (readings page): Theme cookie drives SSR ────────────────────────

test.describe('Bug 3: Theme cookie sets correct page background on readings page', () => {
	test.use({ viewport: { width: 1280, height: 800 } })

	test('dark theme: readings page background has bg-gray-900 class', async ({ page }) => {
		await withLocalPrefs(page, { theme: 'dark' })
		await withCookies(page, [{ name: 'READING_THEME', value: 'dark' }])
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		const classes = await getMainClasses(page)
		expect(classes).toContain('bg-gray-900')
	})

	test('sepia theme: readings page background has bg-[#f5f0e6] class', async ({ page }) => {
		await withLocalPrefs(page, { theme: 'sepia' })
		await withCookies(page, [{ name: 'READING_THEME', value: 'sepia' }])
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		const classes = await getMainClasses(page)
		expect(classes).toContain('bg-[#f5f0e6]')
	})
})

// ─── Bug 4: Settings panel is theme-aware ──────────────────────────────────
//
// The settings panel is a client component. We pass the theme via URL param
// so that both the server render and the client hook agree on the theme.
// The panel background is checked via CSS class (Tailwind v4 uses oklch colors
// so computed background-color strings are not portable across browsers).

test.describe('Bug 4: Settings panel background matches reading theme', () => {
	test.use({ viewport: { width: 1280, height: 800 } })

	async function openSettingsPanel(page: Page) {
		const settingsButton = page.getByRole('button', { name: 'Display languages' })
		await expect(settingsButton).toBeVisible()
		await settingsButton.click()
		await page.waitForTimeout(200)
	}

	async function getPanelClasses(page: Page) {
		// The panel is the floating div with these distinctive Tailwind classes
		const panel = page.locator('[class*="rounded-2xl"][class*="shadow-2xl"]').first()
		await expect(panel).toBeVisible()
		return panel.getAttribute('class')
	}

	test('light theme: settings panel has white background', async ({ page }) => {
		await page.goto(`${LENT_URL}?theme=light`)
		await page.waitForLoadState('networkidle')
		await openSettingsPanel(page)

		const classes = await getPanelClasses(page)
		expect(classes).toContain('bg-white')
	})

	test('dark theme: settings panel has dark background', async ({ page }) => {
		await page.goto(`${LENT_URL}?theme=dark`)
		await page.waitForLoadState('networkidle')
		await openSettingsPanel(page)

		const classes = await getPanelClasses(page)
		expect(classes).toContain('bg-gray-900')
		// Must NOT be white (the pre-fix behavior)
		expect(classes).not.toContain('bg-white')
	})

	test('sepia theme: settings panel has parchment background', async ({ page }) => {
		await page.goto(`${LENT_URL}?theme=sepia`)
		await page.waitForLoadState('networkidle')
		await openSettingsPanel(page)

		const classes = await getPanelClasses(page)
		expect(classes).toContain('bg-[#f5f0e6]')
		// Must NOT be white (the pre-fix behavior)
		expect(classes).not.toContain('bg-white')
	})

	test('readings page: dark theme settings panel has dark background', async ({ page }) => {
		await page.goto('/readings?theme=dark')
		await page.waitForLoadState('networkidle')
		await openSettingsPanel(page)

		const classes = await getPanelClasses(page)
		expect(classes).toContain('bg-gray-900')
		expect(classes).not.toContain('bg-white')
	})
})
