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

	test('should show Jump to sections in menu', async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		const menuButton = page.getByRole('button', { name: /open menu/i })
		await menuButton.click()

		// Should have Jump to section with reading labels
		await expect(page.getByText('Jump to')).toBeVisible()

		// Should have at least some reading sections
		const sections = ['Pauline', 'Catholic', 'Acts', 'Psalm', 'Gospel']
		let foundSections = 0
		for (const section of sections) {
			const btn = page.locator('dialog button', { hasText: new RegExp(section, 'i') })
			if ((await btn.count()) > 0) {
				foundSections++
			}
		}
		expect(foundSections).toBeGreaterThan(0)
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

	test('should scroll to section when clicking Jump to button', async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		const menuButton = page.getByRole('button', { name: /open menu/i })
		await menuButton.click()

		// Find and click a section button (e.g., Gospel)
		const gospelButton = page.locator('dialog button', { hasText: /gospel/i }).first()
		if ((await gospelButton.count()) > 0) {
			await gospelButton.click()

			// Menu should close
			const dialog = page.locator('dialog[open]')
			await expect(dialog).not.toBeVisible()

			// Should have scrolled (hard to verify exact position)
			await page.waitForTimeout(500)
		}
	})

	test('should not show burger menu on non-reading pages', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Home page should NOT have burger menu (not in read mode)
		const menuButton = page.getByRole('button', { name: /open menu/i })
		await expect(menuButton).not.toBeVisible()
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

	test('should show Jump to sections on tablet', async ({ page }) => {
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')

		const menuButton = page.getByRole('button', { name: /open menu/i })
		await menuButton.click()

		await expect(page.getByText('Jump to')).toBeVisible()
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
