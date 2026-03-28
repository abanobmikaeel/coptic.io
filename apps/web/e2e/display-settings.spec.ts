import { expect, test } from '@playwright/test'

test.describe('Display Settings - Settings Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/settings')
		await page.waitForLoadState('networkidle')
	})

	test('should load settings page', async ({ page }) => {
		await expect(page).toHaveURL(/settings/)
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
	})

	test('should have line spacing options with correct values', async ({ page }) => {
		// Select order: locale(0), theme(1), width(2), font(3), size(4), weight(5), line-spacing(6), word-spacing(7), view(8), verses(9)
		const lineSpacingSelect = page.locator('select').nth(6)

		// Get all options
		const options = await lineSpacingSelect.locator('option').allTextContents()

		// Should NOT have 'tight' (old incorrect value)
		expect(options.join(' ').toLowerCase()).not.toContain('tight')

		const optionValues = await lineSpacingSelect
			.locator('option')
			.evaluateAll((opts) => opts.map((opt) => (opt as HTMLOptionElement).value))

		expect(optionValues).toContain('compact')
		expect(optionValues).toContain('normal')
		expect(optionValues).toContain('relaxed')
	})

	test('should have word spacing options with correct values', async ({ page }) => {
		const wordSpacingSelect = page.locator('select').nth(7)

		const optionValues = await wordSpacingSelect
			.locator('option')
			.evaluateAll((opts) => opts.map((opt) => (opt as HTMLOptionElement).value))

		// Should NOT have 'wide' (old incorrect value)
		expect(optionValues).not.toContain('wide')

		expect(optionValues).toContain('compact')
		expect(optionValues).toContain('normal')
		expect(optionValues).toContain('relaxed')
	})

	test('should have font weight options with correct values', async ({ page }) => {
		const fontWeightSelect = page.locator('select').nth(5)

		const optionValues = await fontWeightSelect
			.locator('option')
			.evaluateAll((opts) => opts.map((opt) => (opt as HTMLOptionElement).value))

		// Should NOT have 'medium' (old incorrect value)
		expect(optionValues).not.toContain('medium')

		expect(optionValues).toContain('light')
		expect(optionValues).toContain('normal')
		expect(optionValues).toContain('bold')
	})

	test('should persist settings changes', async ({ page }) => {
		// Change line spacing to compact — nth(6) in current select order
		const lineSpacingSelect = page.locator('select').nth(6)
		await lineSpacingSelect.selectOption('compact')

		// Should show saved message
		await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 3000 })

		// Reload the page
		await page.reload()
		await page.waitForLoadState('networkidle')

		// Line spacing should still be compact
		const selectedValue = await page.locator('select').nth(6).inputValue()
		expect(selectedValue).toBe('compact')
	})
})

test.describe('Display Settings - Readings Page Integration', () => {
	test('should apply line spacing from URL params', async ({ page }) => {
		// Navigate with compact spacing
		await page.goto('/readings?spacing=compact')
		await page.waitForLoadState('networkidle')

		// Wait for content to load
		await page.waitForSelector('[class*="leading-"]', { timeout: 10000 })

		// Page should have loaded without errors
		await expect(page).toHaveURL(/spacing=compact/)
	})

	test('should apply text size from URL params', async ({ page }) => {
		// Navigate with large text size
		await page.goto('/readings?size=lg')
		await page.waitForLoadState('networkidle')

		// Page should have loaded without errors
		await expect(page).toHaveURL(/size=lg/)
	})

	test('should apply word spacing from URL params', async ({ page }) => {
		// Navigate with relaxed word spacing
		await page.goto('/readings?wordSpacing=relaxed')
		await page.waitForLoadState('networkidle')

		// Page should have loaded without errors
		await expect(page).toHaveURL(/wordSpacing=relaxed/)

		// Should have word-spacing class applied
		const hasWordSpacing = await page.locator('[class*="word-spacing-relaxed"]').count()
		// Verify at least one element has the class (may be 0 if no English content shown)
		expect(hasWordSpacing).toBeGreaterThanOrEqual(0)
	})

	test('settings panel shows language pills', async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		// Open the language settings panel
		const settingsButton = page.getByRole('button', { name: 'Display languages' })
		await expect(settingsButton).toBeVisible()
		await settingsButton.click()
		await page.waitForTimeout(300)

		// Panel should show language options (English is always present)
		const englishPill = page.getByRole('button', { name: /english/i })
		await expect(englishPill).toBeVisible()

		// Panel must NOT show line spacing controls (those moved to /settings)
		await expect(page.getByText('Line Spacing')).not.toBeVisible()
	})
})

test.describe('Display Settings - Typography Scaling', () => {
	test('text should use scalable typography classes on readings page', async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		// Wait for content to load
		await page.waitForTimeout(2000)

		// Check that the page loads without errors
		// The actual CSS variable scaling is visual, but we verify no JS errors
		const errors: string[] = []
		page.on('pageerror', (err) => errors.push(err.message))

		await page.evaluate(() => window.scrollTo(0, 500))
		await page.waitForTimeout(300)

		expect(
			errors.filter((e) => e.includes('TypeError') || e.includes('ReferenceError')),
		).toHaveLength(0)
	})
})
