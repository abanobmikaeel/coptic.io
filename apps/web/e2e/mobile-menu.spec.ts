import { expect, test } from '@playwright/test'

test.describe('Mobile Menu - Phone', () => {
	test.use({ viewport: { width: 375, height: 667 } })

	test('should show burger menu button on readings page', async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		const menuButton = page.getByRole('button', { name: /open menu/i })
		await expect(menuButton).toBeVisible()
	})

	test('should open menu dialog when clicking burger', async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		const menuButton = page.getByRole('button', { name: /open menu/i })
		await menuButton.click()
		await page.waitForTimeout(300)

		// Dialog should be visible (check for dialog element)
		const dialog = page.locator('dialog')
		await expect(dialog).toBeVisible()

		// Should show Coptic IO branding in the dialog
		const copticText = page.locator('dialog').getByText('Coptic IO')
		await expect(copticText).toBeVisible()
	})

	test('should show navigation links in menu', async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		const menuButton = page.getByRole('button', { name: /open menu/i })
		await menuButton.click()
		await page.waitForTimeout(300)

		// Should have Read section links inside the dialog
		const dialog = page.locator('dialog')
		await expect(dialog.getByText('Katamaros')).toBeVisible()
		await expect(dialog.getByText('Agpeya')).toBeVisible()
		await expect(dialog.getByText('Synaxarium')).toBeVisible()

		// Should have More section (use getByRole to avoid duplicate matches)
		await expect(dialog.getByRole('link', { name: /calendar/i })).toBeVisible()
		await expect(dialog.getByRole('link', { name: /settings/i })).toBeVisible()
	})

	test('should show collapsible reading sections', async ({ page }) => {
		await page.goto('/readings')

		// Reading sections render as inline collapsible buttons in the page body
		// (the old in-menu "Jump to" list was removed in a UI refactor).
		const main = page.locator('main')
		await expect(main.getByRole('button', { name: /pauline/i })).toBeVisible()
		await expect(main.getByRole('button', { name: /catholic/i })).toBeVisible()
	})

	test('should close menu when clicking close button', async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		const menuButton = page.getByRole('button', { name: /open menu/i })
		await menuButton.click()

		const closeButton = page.getByRole('button', { name: /close menu/i })
		await closeButton.click()

		const dialog = page.locator('dialog[open]')
		await expect(dialog).not.toBeVisible()
	})

	test('should close menu when navigating', async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		const menuButton = page.getByRole('button', { name: /open menu/i })
		await menuButton.click()

		// Click on Settings link
		const settingsLink = page.locator('dialog').getByRole('link', { name: /settings/i })
		await settingsLink.click()

		await expect(page).toHaveURL(/settings/)

		// Dialog should be closed
		const dialog = page.locator('dialog[open]')
		await expect(dialog).not.toBeVisible()
	})

	test('should collapse a section when its header is clicked', async ({ page }) => {
		await page.goto('/readings')

		// Sections are expanded by default; clicking the header collapses the body.
		const pauline = page
			.locator('article')
			.filter({ hasText: /pauline/i })
			.first()
		await expect(pauline.getByText(/Glory be to God forever/)).toBeVisible()

		await pauline.getByRole('button', { name: /pauline/i }).click()
		await expect(pauline.getByText(/Glory be to God forever/)).not.toBeVisible()
	})

	test('should show burger menu on non-reading pages', async ({ page }) => {
		await page.goto('/')

		// The hamburger menu is now global (not readings-only), so the home page
		// also exposes it.
		await expect(page.getByRole('button', { name: /open menu/i })).toBeVisible()
	})

	test('should highlight current page in menu', async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		const menuButton = page.getByRole('button', { name: /open menu/i })
		await menuButton.click()

		// Katamaros link should be highlighted (active)
		const katamarosLink = page.locator('dialog').getByRole('link', { name: /katamaros/i })
		// Check for amber/active styling class
		await expect(katamarosLink).toHaveClass(/amber/)
	})
})

test.describe('Mobile Menu - Tablet', () => {
	test.use({ viewport: { width: 768, height: 1024 } })

	test('should show burger menu on tablet readings page', async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		const menuButton = page.getByRole('button', { name: /open menu/i })
		await expect(menuButton).toBeVisible()
	})

	test('should show collapsible reading sections on tablet', async ({ page }) => {
		await page.goto('/readings')

		const main = page.locator('main')
		await expect(main.getByRole('button', { name: /pauline/i })).toBeVisible()
		await expect(main.getByRole('button', { name: /catholic/i })).toBeVisible()
	})
})

test.describe('Mobile Menu - Desktop', () => {
	// xl breakpoint is 1280px, so use larger viewport
	test.use({ viewport: { width: 1400, height: 900 } })

	test('should NOT show burger menu on desktop readings page', async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		// Desktop should have the full navbar, not burger menu
		const menuButton = page.getByRole('button', { name: /open menu/i })
		await expect(menuButton).not.toBeVisible()
	})

	test('should show sidebar timeline on desktop', async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		// Desktop (xl+) should have sidebar navigation (the one with fixed right positioning)
		const sidebar = page.locator('nav[aria-label="Reading navigation"].fixed.right-4')
		await expect(sidebar).toBeVisible()
	})
})
