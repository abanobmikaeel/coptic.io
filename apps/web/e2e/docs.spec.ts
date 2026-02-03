import { expect, test } from '@playwright/test'

test.describe('API Documentation page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/docs')
		await page.waitForLoadState('networkidle')
	})

	test('should load the page', async ({ page }) => {
		await expect(page).toHaveURL(/docs/)
	})

	test('should display page title', async ({ page }) => {
		await expect(page.getByRole('heading', { name: /API Documentation/i })).toBeVisible()
	})

	test('should show base URL', async ({ page }) => {
		// Base URL shows either production or localhost depending on environment
		await expect(page.getByText(/Base URL/i)).toBeVisible()
		// Should have a code element with the API URL
		await expect(page.locator('code').first()).toBeVisible()
	})

	test('should display endpoint groups', async ({ page }) => {
		// Check for main API sections
		const sections = ['Calendar', 'Readings', 'Celebrations', 'Fasting', 'Seasons', 'Synaxarium']

		for (const section of sections) {
			await expect(page.getByRole('heading', { name: section })).toBeVisible()
		}
	})

	test('should show GET method badges', async ({ page }) => {
		const getBadges = page.getByText('GET', { exact: true })
		const count = await getBadges.count()
		expect(count).toBeGreaterThan(5)
	})

	test('should have link to examples page', async ({ page }) => {
		const examplesLink = page.getByRole('link', { name: /examples/i })
		await expect(examplesLink).toBeVisible()
	})

	test('should have link to GraphQL', async ({ page }) => {
		const graphqlLink = page.getByText('/graphql')
		await expect(graphqlLink).toBeVisible()
	})

	test('should have link to OpenAPI spec', async ({ page }) => {
		const openapiLink = page.getByRole('link', { name: /OpenAPI/i })
		await expect(openapiLink).toBeVisible()
	})
})
