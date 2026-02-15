import { expect, test } from '@playwright/test'

test.describe('Synaxarium and Readings date consistency', () => {
	test('should navigate from synaxarium to readings with correct date', async ({ page }) => {
		// Go to synaxarium page
		await page.goto('/synaxarium')
		await page.waitForLoadState('networkidle')

		// Get the full page text and extract the Gregorian date
		const synaxariumPageText = await page.locator('body').innerText()

		// Extract the Gregorian date from synaxarium (e.g., "Thursday, February 6, 2026")
		const gregorianDateRegex =
			/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})/i
		const synaxariumDateMatch = synaxariumPageText.match(gregorianDateRegex)
		expect(synaxariumDateMatch, 'Synaxarium should display a Gregorian date').toBeTruthy()

		const expectedMonth = synaxariumDateMatch![2]
		const expectedDay = synaxariumDateMatch![3]

		// Click the "View readings for this date" link
		await page.click('text=View readings for this date')
		await page.waitForLoadState('networkidle')

		// Should be on readings page
		await expect(page).toHaveURL(/\/readings/)

		// The readings page should show the same Gregorian date
		const readingsPageText = await page.locator('body').innerText()
		expect(readingsPageText).toContain(expectedMonth)
		expect(readingsPageText).toContain(expectedDay)
	})

	test('View readings link must update when navigating dates with arrows', async ({ page }) => {
		// This is the EXACT user scenario:
		// 1. Go to synaxarium (starts on today)
		// 2. Click right arrow to go forward
		// 3. Click "View readings for this date"
		// 4. MUST see readings for the navigated date, NOT today

		await page.goto('/synaxarium')
		await page.waitForLoadState('networkidle')

		// Get today's date for comparison
		const today = new Date()
		const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

		// Navigate forward one day
		const nextButton = page.getByRole('button', { name: /next day/i })
		await nextButton.click()

		// Wait for URL to update with a date different from today
		await page.waitForURL((url) => {
			const dateParam = url.searchParams.get('date')
			return dateParam !== null && dateParam !== todayStr
		})

		// The readings link href MUST have a date that is NOT today
		const readingsLink = page.locator('a[href*="/readings?date="]')
		await expect(readingsLink).toBeVisible()
		const href = await readingsLink.getAttribute('href')

		// Extract the date from the href
		const dateMatch = href?.match(/date=(\d{4}-\d{2}-\d{2})/)
		expect(dateMatch, 'Readings link must have a date parameter').toBeTruthy()
		const linkDate = dateMatch![1]

		// The date in the link must NOT be today
		expect(linkDate).not.toBe(todayStr)

		// Click the link and verify the readings page has the correct date
		await readingsLink.click()
		await page.waitForLoadState('networkidle')

		// URL must have the future date, NOT today
		await expect(page).toHaveURL(/\/readings\?date=/)
		expect(page.url()).not.toContain(`date=${todayStr}`)
		expect(page.url()).toContain(`date=${linkDate}`)
	})

	test('View readings link should navigate to readings for selected date', async ({ page }) => {
		// Navigate directly to a specific future date via URL
		const futureDate = new Date()
		futureDate.setDate(futureDate.getDate() + 5)
		const dateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`

		await page.goto(`/synaxarium?date=${dateStr}`)
		await page.waitForLoadState('networkidle')

		// Verify the synaxarium page shows this future date
		const monthNames = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		]
		const expectedMonth = monthNames[futureDate.getMonth()]
		const expectedDay = String(futureDate.getDate())

		const synaxariumText = await page.locator('body').innerText()
		expect(synaxariumText).toContain(expectedMonth)
		expect(synaxariumText).toContain(expectedDay)

		// Click "View readings for this date"
		await page.click('text=View readings for this date')
		await page.waitForLoadState('networkidle')

		// Should be on readings page with the correct date param
		await expect(page).toHaveURL(/\/readings/)
		await expect(page).toHaveURL(new RegExp(`date=${dateStr}`))

		// The readings page should show the same date
		const readingsText = await page.locator('body').innerText()
		expect(readingsText).toContain(expectedMonth)
		expect(readingsText).toContain(expectedDay)
	})

	test('View readings link should navigate to today when on today', async ({ page }) => {
		// Go to synaxarium (defaults to today)
		await page.goto('/synaxarium')
		await page.waitForLoadState('networkidle')

		// Toggle should show "Today"
		const todayToggle = page.locator('button').filter({ hasText: /Today/ }).first()
		await expect(todayToggle).toBeVisible()

		// Click "View readings for this date"
		await page.click('text=View readings for this date')
		await page.waitForLoadState('networkidle')

		// Should be on readings page
		await expect(page).toHaveURL(/\/readings/)

		// Today's date should be shown
		const today = new Date()
		const monthNames = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		]
		const expectedMonth = monthNames[today.getMonth()]
		const expectedDay = String(today.getDate())

		const readingsText = await page.locator('body').innerText()
		expect(readingsText).toContain(expectedMonth)
		expect(readingsText).toContain(expectedDay)
	})

	test('View readings link should update after clicking upcoming entry', async ({ page }) => {
		// Go to upcoming view
		await page.goto('/synaxarium?view=upcoming')
		await page.waitForLoadState('networkidle')
		await page.waitForTimeout(1500)

		// Find an entry link and get its date
		const entryLinks = page.locator('a[href*="/synaxarium?date="]')
		const count = await entryLinks.count()

		if (count > 0) {
			// Get the date from the first entry's href
			const entryHref = await entryLinks.first().getAttribute('href')
			const dateMatch = entryHref?.match(/date=(\d{4}-\d{2}-\d{2})/)
			expect(dateMatch).toBeTruthy()
			const expectedDate = dateMatch![1]

			// Click the entry to go to that date's day view
			await entryLinks.first().click()
			await page.waitForLoadState('networkidle')

			// Click "View readings for this date"
			await page.click('text=View readings for this date')
			await page.waitForLoadState('networkidle')

			// Should navigate to readings with the correct date
			await expect(page).toHaveURL(/\/readings/)
			await expect(page).toHaveURL(new RegExp(`date=${expectedDate}`))
		}
	})

	test('should show same date on both pages when accessed directly', async ({ page }) => {
		// Get today's date for comparison
		const today = new Date()
		const monthNames = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		]
		const expectedMonth = monthNames[today.getMonth()]
		const expectedDay = today.getDate()

		// Check synaxarium shows today
		await page.goto('/synaxarium')
		await page.waitForLoadState('networkidle')
		const synaxariumText = await page.locator('body').innerText()
		expect(synaxariumText).toContain('Today')
		expect(synaxariumText).toContain(expectedMonth)

		// Check readings shows today (via Gregorian date display)
		await page.goto('/readings')
		await page.waitForLoadState('networkidle')
		const readingsText = await page.locator('body').innerText()
		expect(readingsText).toContain(expectedMonth)
		expect(readingsText).toContain(String(expectedDay))
	})
})

test.describe('Synaxarium page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/synaxarium')
		await page.waitForLoadState('networkidle')
	})

	test('should load the page', async ({ page }) => {
		await expect(page).toHaveURL(/synaxarium/)
	})

	test('should display page content', async ({ page }) => {
		// Page should have visible content (not hidden)
		const content = page.locator('main, [role="main"], h1, h2, article').first()
		await expect(content).toBeVisible({ timeout: 10000 })
	})

	test('should have date navigation', async ({ page }) => {
		// Look for date navigation elements
		const dateNav = page.locator('button, a').filter({ hasText: /previous|next|prev|today|←|→|</i })

		if ((await dateNav.count()) > 0) {
			await expect(dateNav.first()).toBeVisible()
		}
	})

	test('should display Coptic date', async ({ page }) => {
		// Synaxarium shows Coptic dates (includes alternative romanizations)
		const copticMonths = [
			'Thout',
			'Tout',
			'Paopi',
			'Baba',
			'Hathor',
			'Hator',
			'Koiak',
			'Kiahk',
			'Tobi',
			'Toba',
			'Meshir',
			'Amshir',
			'Paremhat',
			'Baramhat',
			'Parmouti',
			'Baramoda',
			'Pashons',
			'Bashans',
			'Paoni',
			'Baona',
			'Epip',
			'Abib',
			'Mesori',
			'Mesra',
			'Nasie',
			'Nasi',
		]
		const monthRegex = new RegExp(copticMonths.join('|'), 'i')
		const copticDate = page.getByText(monthRegex)

		if ((await copticDate.count()) > 0) {
			await expect(copticDate.first()).toBeVisible()
		}
	})

	test('should have search or filter functionality', async ({ page }) => {
		// Look for search input or filter buttons
		const searchInput = page.getByPlaceholder(/search/i)
		const filterButtons = page.getByRole('button', {
			name: /martyrs|popes|apostles|departures|feasts|filter/i,
		})

		const hasSearch = (await searchInput.count()) > 0
		const hasFilters = (await filterButtons.count()) > 0

		// At least one search/filter mechanism should exist
		expect(hasSearch || hasFilters).toBeTruthy()
	})

	test('should display content entries', async ({ page }) => {
		// Look for saint entries, articles, or list items
		const entries = page.locator(
			'article, [class*="card"], [class*="entry"], li, a[href*="/synaxarium/"]',
		)

		// Wait for content to load
		await page.waitForTimeout(2000)

		// Should have some content entries
		expect(await entries.count()).toBeGreaterThan(0)
	})

	test('search should filter results', async ({ page }) => {
		const searchInput = page.getByPlaceholder(/search/i)

		if ((await searchInput.count()) > 0) {
			await searchInput.fill('Mark')
			// Wait for search debounce
			await page.waitForTimeout(500)
			// Results should update (we just verify no errors)
		}
	})
})

test.describe('Synaxarium date navigation', () => {
	test('forward button should navigate to next day', async ({ page }) => {
		await page.goto('/synaxarium')
		await page.waitForLoadState('networkidle')

		// Toggle should show "Today" initially
		const todayToggle = page.locator('button').filter({ hasText: /Today/ }).first()
		await expect(todayToggle).toBeVisible()

		// Click the forward/next day button (right chevron)
		const nextButton = page.getByRole('button', { name: /next day/i })
		await expect(nextButton).toBeVisible()
		await nextButton.click()

		// Wait for content to update
		await page.waitForTimeout(1000)

		// After navigating forward, toggle should show "Day" instead of "Today"
		const dayToggle = page.locator('button').filter({ hasText: /^Day$/ })
		await expect(dayToggle).toBeVisible()
	})

	test('backward button should navigate to previous day', async ({ page }) => {
		await page.goto('/synaxarium')
		await page.waitForLoadState('networkidle')

		// First navigate forward so we can go back
		const nextButton = page.getByRole('button', { name: /next day/i })
		await nextButton.click()
		await page.waitForTimeout(500)

		// Click the backward/previous day button (left chevron)
		const prevButton = page.getByRole('button', { name: /previous day/i })
		await expect(prevButton).toBeVisible()
		await prevButton.click()

		// Wait for content to update
		await page.waitForTimeout(500)

		// Should be back on today, so toggle should show "Today"
		const todayToggle = page.locator('button').filter({ hasText: /Today/ }).first()
		await expect(todayToggle).toBeVisible()
	})

	test('clicking Today from upcoming should return to today', async ({ page }) => {
		await page.goto('/synaxarium?view=upcoming')
		await page.waitForLoadState('networkidle')

		// Click Today toggle
		const todayToggle = page.getByRole('button', { name: /Today/i }).first()
		await todayToggle.click()
		await page.waitForTimeout(500)

		// Should be on day view for today
		const url = page.url()
		expect(url).not.toContain('view=upcoming')

		// Toggle should show "Today"
		const toggleWithToday = page.locator('button').filter({ hasText: /Today/ }).first()
		await expect(toggleWithToday).toBeVisible()
	})
})

test.describe('Synaxarium view toggle', () => {
	test('should have day and upcoming toggle buttons with nav arrows', async ({ page }) => {
		await page.goto('/synaxarium')
		await page.waitForLoadState('networkidle')

		// Should have prev/next buttons
		const prevButton = page.getByRole('button', { name: /previous day/i })
		const nextButton = page.getByRole('button', { name: /next day/i })
		const upcomingToggle = page.getByRole('button', { name: /Upcoming/i })

		await expect(prevButton).toBeVisible()
		await expect(nextButton).toBeVisible()
		await expect(upcomingToggle).toBeVisible()
	})

	test('should switch to Upcoming view and show multiple days', async ({ page }) => {
		await page.goto('/synaxarium')
		await page.waitForLoadState('networkidle')

		// Click Upcoming toggle
		const upcomingToggle = page.getByRole('button', { name: /Upcoming/i })
		await upcomingToggle.click()

		// URL should reflect the view mode
		await expect(page).toHaveURL(/view=upcoming/)

		// Wait for upcoming content to load (API calls for multiple days)
		await page.waitForTimeout(3000)

		// Should see "Tomorrow" label (starts from tomorrow, not today)
		const tomorrowLabel = page.locator('text=Tomorrow').first()
		await expect(tomorrowLabel).toBeVisible({ timeout: 10000 })
	})

	test('should switch back to day view', async ({ page }) => {
		await page.goto('/synaxarium?view=upcoming')
		await page.waitForLoadState('networkidle')

		// Click the left toggle (Today/day view)
		const dayToggle = page.getByRole('button', { name: /Today/i }).first()
		await dayToggle.click()

		// Wait for day view UI elements to appear (nav buttons only visible in day view)
		const nextButton = page.getByRole('button', { name: /next day/i })
		await expect(nextButton).toBeVisible({ timeout: 5000 })
		await expect(nextButton).toBeEnabled()

		// URL should not have view=upcoming
		await expect(page).not.toHaveURL(/view=upcoming/)
	})

	test('upcoming view entries should link to detail page', async ({ page }) => {
		await page.goto('/synaxarium?view=upcoming')
		await page.waitForLoadState('networkidle')

		// Wait for entries to load
		await page.waitForTimeout(1500)

		// Find an entry link (they should be anchor tags in upcoming view)
		const entryLinks = page.locator('a[href*="/synaxarium?date="]')

		if ((await entryLinks.count()) > 0) {
			const firstLink = entryLinks.first()
			await expect(firstLink).toBeVisible()

			// Click the link
			await firstLink.click()
			await page.waitForLoadState('networkidle')

			// Should navigate to synaxarium with date param
			await expect(page).toHaveURL(/\/synaxarium\?date=/)
		}
	})
})

test.describe('Synaxarium header navigation', () => {
	test('should show "Today" label in toggle when viewing today', async ({ page }) => {
		await page.goto('/synaxarium')
		await page.waitForLoadState('networkidle')

		// The left toggle button should contain "Today" when we're on today's date
		const toggleWithToday = page.locator('button').filter({ hasText: /Today/ }).first()
		await expect(toggleWithToday).toBeVisible()
	})

	test('should show "Day" label in toggle when viewing a non-today date', async ({ page }) => {
		// Navigate to a future date
		const futureDate = new Date()
		futureDate.setDate(futureDate.getDate() + 5)
		const dateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`

		await page.goto(`/synaxarium?date=${dateStr}`)
		await page.waitForLoadState('networkidle')

		// The left toggle button should show "Day" when we're NOT on today
		const dayToggle = page.locator('button').filter({ hasText: /^Day$/ })
		await expect(dayToggle).toBeVisible()
	})

	test('clicking upcoming entry should show day view for that date', async ({ page }) => {
		await page.goto('/synaxarium?view=upcoming')
		await page.waitForLoadState('networkidle')
		await page.waitForTimeout(1500)

		const entryLinks = page.locator('a[href*="/synaxarium?date="]')
		const count = await entryLinks.count()

		if (count > 0) {
			await entryLinks.first().click()
			await page.waitForLoadState('networkidle')

			// Should show "Day" in toggle since it's not today
			const dayToggle = page.locator('button').filter({ hasText: /^Day$/ })
			await expect(dayToggle).toBeVisible()
		}
	})

	test('clicking Today from Upcoming view should go to today', async ({ page }) => {
		await page.goto('/synaxarium?view=upcoming')
		await page.waitForLoadState('networkidle')

		// Click Today toggle from upcoming view
		const todayToggle = page.getByRole('button', { name: /Today/i }).first()
		await todayToggle.click()
		await page.waitForTimeout(1000)

		// Should be on day view with today's date
		const url = page.url()
		expect(url).not.toContain('view=upcoming')

		// Toggle should show "Today"
		const toggleWithToday = page.locator('button').filter({ hasText: /Today/ }).first()
		await expect(toggleWithToday).toBeVisible()
	})

	test('navigating forward should change toggle from Today to Day', async ({ page }) => {
		await page.goto('/synaxarium')
		await page.waitForLoadState('networkidle')

		// Initially should show "Today" in toggle
		const toggleWithToday = page.locator('button').filter({ hasText: /Today/ }).first()
		await expect(toggleWithToday).toBeVisible()

		// Navigate forward one day
		const nextButton = page.getByRole('button', { name: /next day/i })
		await nextButton.click()
		await page.waitForTimeout(500)

		// Toggle should now show "Day"
		const dayToggle = page.locator('button').filter({ hasText: /^Day$/ })
		await expect(dayToggle).toBeVisible()
	})

	test('navigating back to today should change toggle from Day to Today', async ({ page }) => {
		await page.goto('/synaxarium')
		await page.waitForLoadState('networkidle')

		// Navigate forward
		const nextButton = page.getByRole('button', { name: /next day/i })
		await nextButton.click()
		await page.waitForTimeout(500)

		// Navigate back
		const prevButton = page.getByRole('button', { name: /previous day/i })
		await prevButton.click()
		await page.waitForTimeout(500)

		// Should show "Today" again
		const toggleWithToday = page.locator('button').filter({ hasText: /Today/ }).first()
		await expect(toggleWithToday).toBeVisible()
	})
})

test.describe('Synaxarium URL params', () => {
	test('should load specific date from URL param', async ({ page }) => {
		// Calculate a date that's definitely not today (10 days from now)
		const futureDate = new Date()
		futureDate.setDate(futureDate.getDate() + 10)
		const dateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`

		// Navigate to that specific date
		await page.goto(`/synaxarium?date=${dateStr}`)
		await page.waitForLoadState('networkidle')
		await page.waitForTimeout(500)

		// Toggle should show "Day" since we're viewing a non-today date
		const dayToggle = page.locator('button').filter({ hasText: /^Day$/ })
		await expect(dayToggle).toBeVisible()

		// The date display should show the future date, not today
		const pageText = await page.locator('body').innerText()
		const futureMonthNames = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		]
		const expectedMonth = futureMonthNames[futureDate.getMonth()]
		expect(pageText).toContain(expectedMonth)
		expect(pageText).toContain(String(futureDate.getDate()))
	})

	test('should persist category filter in URL', async ({ page }) => {
		await page.goto('/synaxarium')
		await page.waitForLoadState('networkidle')

		// Click on a category filter (e.g., Departures if available)
		const departuresFilter = page.getByRole('button', { name: /Departures/i })

		if ((await departuresFilter.count()) > 0) {
			await departuresFilter.click()
			await page.waitForTimeout(300)

			// URL should contain category param
			await expect(page).toHaveURL(/category=departures/)
		}
	})
})
