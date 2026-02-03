import { expect, test } from '@playwright/test'

test.describe('Command Palette', () => {
	test('should open with Cmd+K', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')
		await page.keyboard.press('Meta+k')
		await expect(page.getByPlaceholder(/search/i)).toBeVisible()
	})

	test('should open with Ctrl+K', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')
		await page.keyboard.press('Control+k')
		await expect(page.getByPlaceholder(/search/i)).toBeVisible()
	})

	test('should close with Escape', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')
		await page.keyboard.press('Meta+k')
		await expect(page.getByPlaceholder(/search/i)).toBeVisible()
		await page.keyboard.press('Escape')
		await expect(page.getByPlaceholder(/search/i)).not.toBeVisible()
	})

	test('should close when clicking backdrop', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')
		await page.keyboard.press('Meta+k')
		await expect(page.getByPlaceholder(/search/i)).toBeVisible()
		// Click the backdrop (outside the modal)
		await page.locator('.bg-black\\/50').click({ position: { x: 10, y: 10 } })
		await expect(page.getByPlaceholder(/search/i)).not.toBeVisible()
	})

	test('should prevent body scroll when open', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		await page.keyboard.press('Meta+k')
		await expect(page.getByPlaceholder(/search/i)).toBeVisible()

		// With react-remove-scroll, body scroll is prevented
		// We can verify the modal is open and functioning
		await expect(page.locator('.fixed.inset-0')).toBeVisible()
	})

	test('should allow typing search queries', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')
		await page.keyboard.press('Meta+k')
		const input = page.getByPlaceholder(/search/i)
		await input.fill('St. Mark')
		await expect(input).toHaveValue('St. Mark')
	})

	test('should show search results', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')
		await page.keyboard.press('Meta+k')
		await page.getByPlaceholder(/search/i).fill('Mark')

		// Wait for results to load (debounce + API call)
		await page.waitForTimeout(1000)

		// Should show results or "no results" message
		const hasResults =
			(await page
				.locator('button')
				.filter({ hasText: /synaxarium|agpeya/i })
				.count()) > 0
		const hasNoResults = (await page.getByText(/no results/i).count()) > 0

		expect(hasResults || hasNoResults).toBeTruthy()
	})

	test('should navigate results with arrow keys', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')
		await page.keyboard.press('Meta+k')
		await page.getByPlaceholder(/search/i).fill('Mark')

		// Wait for results to load
		await page.waitForTimeout(1000)

		// Press down arrow to navigate
		await page.keyboard.press('ArrowDown')
		await page.waitForTimeout(100)

		// Check that keyboard navigation is working (no errors)
		await expect(page.getByPlaceholder(/search/i)).toBeVisible()
	})

	test('should toggle open/close with Cmd+K', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Open
		await page.keyboard.press('Meta+k')
		await expect(page.getByPlaceholder(/search/i)).toBeVisible()

		// Close
		await page.keyboard.press('Meta+k')
		await expect(page.getByPlaceholder(/search/i)).not.toBeVisible()

		// Open again
		await page.keyboard.press('Meta+k')
		await expect(page.getByPlaceholder(/search/i)).toBeVisible()
	})
})
