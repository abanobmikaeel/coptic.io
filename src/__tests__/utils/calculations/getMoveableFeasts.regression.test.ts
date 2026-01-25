import { describe, expect, it } from 'vitest'
import {
	getMoveableFeastsForDate,
	getMoveableFeastsForYear,
} from '../../../utils/calculations/getMoveableFeasts'

/**
 * Regression tests for moveable feasts against official Coptic Orthodox Church calendars
 * Source of truth: https://www.copticchurch.net/calendar/feasts/[YEAR]
 *
 * These tests validate our Easter calculation algorithm and all Easter-dependent dates
 * against official published calendars from the Coptic Orthodox Church.
 */

describe('Moveable Feasts - 2025 Official Calendar', () => {
	// Official dates from https://www.copticchurch.net/calendar/feasts/2025
	const officialDates2025 = {
		fastOfNineveh: new Date(2025, 1, 10), // February 10
		greatLent: new Date(2025, 1, 24), // February 24
		palmSunday: new Date(2025, 3, 13), // April 13
		holyThursday: new Date(2025, 3, 17), // April 17
		goodFriday: new Date(2025, 3, 18), // April 18
		easter: new Date(2025, 3, 20), // April 20
		thomasSunday: new Date(2025, 3, 27), // April 27
		ascension: new Date(2025, 4, 29), // May 29
		pentecost: new Date(2025, 5, 8), // June 8
		apostlesFeast: new Date(2025, 6, 12), // July 12 (end of Apostles' Fast)
	}

	it('should calculate Easter 2025 correctly', () => {
		const feasts = getMoveableFeastsForDate(officialDates2025.easter)
		const easter = feasts.find((f) => f.name === 'Easter')

		expect(easter).toBeDefined()
		expect(easter?.date.getFullYear()).toBe(2025)
		expect(easter?.date.getMonth()).toBe(3) // April (0-indexed)
		expect(easter?.date.getDate()).toBe(20)
	})

	it('should calculate Fast of Nineveh 2025 correctly', () => {
		const feasts = getMoveableFeastsForDate(officialDates2025.fastOfNineveh)
		const nineveh = feasts.find((f) => f.name === 'Fast of Nineveh')

		expect(nineveh).toBeDefined()
		expect(nineveh?.date.toDateString()).toBe(officialDates2025.fastOfNineveh.toDateString())
	})

	it('should calculate Great Lent 2025 correctly', () => {
		const feasts = getMoveableFeastsForDate(officialDates2025.greatLent)
		const greatLent = feasts.find((f) => f.name === 'Great Lent')

		expect(greatLent).toBeDefined()
		expect(greatLent?.date.toDateString()).toBe(officialDates2025.greatLent.toDateString())
	})

	it('should calculate Palm Sunday 2025 correctly', () => {
		const feasts = getMoveableFeastsForDate(officialDates2025.palmSunday)
		const palmSunday = feasts.find((f) => f.name === 'Palm Sunday')

		expect(palmSunday).toBeDefined()
		expect(palmSunday?.date.toDateString()).toBe(officialDates2025.palmSunday.toDateString())
	})

	it('should calculate Holy Thursday 2025 correctly', () => {
		const feasts = getMoveableFeastsForDate(officialDates2025.holyThursday)
		const holyThursday = feasts.find((f) => f.name === 'Holy Thursday')

		expect(holyThursday).toBeDefined()
		expect(holyThursday?.date.toDateString()).toBe(officialDates2025.holyThursday.toDateString())
	})

	it('should calculate Good Friday 2025 correctly', () => {
		const feasts = getMoveableFeastsForDate(officialDates2025.goodFriday)
		const goodFriday = feasts.find((f) => f.name === 'Good Friday')

		expect(goodFriday).toBeDefined()
		expect(goodFriday?.date.toDateString()).toBe(officialDates2025.goodFriday.toDateString())
	})

	it('should calculate Thomas Sunday 2025 correctly', () => {
		const feasts = getMoveableFeastsForDate(officialDates2025.thomasSunday)
		const thomasSunday = feasts.find((f) => f.name === 'Thomas Sunday')

		expect(thomasSunday).toBeDefined()
		expect(thomasSunday?.date.toDateString()).toBe(officialDates2025.thomasSunday.toDateString())
	})

	it('should calculate Ascension 2025 correctly', () => {
		const feasts = getMoveableFeastsForDate(officialDates2025.ascension)
		const ascension = feasts.find((f) => f.name === 'Ascension')

		expect(ascension).toBeDefined()
		expect(ascension?.date.toDateString()).toBe(officialDates2025.ascension.toDateString())
	})

	it('should calculate Pentecost 2025 correctly', () => {
		const feasts = getMoveableFeastsForDate(officialDates2025.pentecost)
		const pentecost = feasts.find((f) => f.name === 'Pentecost')

		expect(pentecost).toBeDefined()
		expect(pentecost?.date.toDateString()).toBe(officialDates2025.pentecost.toDateString())
	})

	it('should calculate all 10 moveable feasts for 2025', () => {
		const feasts = getMoveableFeastsForYear(2025)
		expect(feasts.length).toBe(10)
	})
})

describe('Moveable Feasts - Multi-Year Regression', () => {
	/**
	 * Test multiple years to ensure algorithm works beyond 2025
	 * These dates can be verified at: https://www.copticchurch.net/calendar/feasts/[YEAR]
	 */

	it('should calculate Easter for multiple years within valid range', () => {
		// Test years from 1900-2199 (algorithm's valid range)
		const testYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]

		testYears.forEach((year) => {
			const feasts = getMoveableFeastsForYear(year)
			const easter = feasts.find((f) => f.name === 'Easter')

			expect(easter).toBeDefined()
			expect(easter?.date.getFullYear()).toBe(year)
			// Easter should always be in March, April, or May
			expect([2, 3, 4]).toContain(easter?.date.getMonth())
		})
	})

	it('should maintain correct day offsets from Easter for all feasts', () => {
		const feasts = getMoveableFeastsForYear(2025)
		const easter = feasts.find((f) => f.name === 'Easter')

		expect(easter).toBeDefined()
		if (!easter) return

		// Verify all other feasts maintain correct offset from Easter
		feasts.forEach((feast) => {
			const daysDiff = Math.round(
				(feast.date.getTime() - easter.date.getTime()) / (1000 * 60 * 60 * 24),
			)
			expect(daysDiff).toBe(feast.daysFromEaster)
		})
	})

	it('should ensure Palm Sunday is always 7 days before Easter', () => {
		const testYears = [2020, 2021, 2022, 2023, 2024, 2025]

		testYears.forEach((year) => {
			const feasts = getMoveableFeastsForYear(year)
			const easter = feasts.find((f) => f.name === 'Easter')
			const palmSunday = feasts.find((f) => f.name === 'Palm Sunday')

			expect(easter).toBeDefined()
			expect(palmSunday).toBeDefined()

			if (easter && palmSunday) {
				const daysDiff = (easter.date.getTime() - palmSunday.date.getTime()) / (1000 * 60 * 60 * 24)
				expect(daysDiff).toBe(7)
			}
		})
	})

	it('should ensure Pentecost is always 49 days after Easter', () => {
		const testYears = [2020, 2021, 2022, 2023, 2024, 2025]

		testYears.forEach((year) => {
			const feasts = getMoveableFeastsForYear(year)
			const easter = feasts.find((f) => f.name === 'Easter')
			const pentecost = feasts.find((f) => f.name === 'Pentecost')

			expect(easter).toBeDefined()
			expect(pentecost).toBeDefined()

			if (easter && pentecost) {
				const daysDiff = (pentecost.date.getTime() - easter.date.getTime()) / (1000 * 60 * 60 * 24)
				expect(daysDiff).toBe(49)
			}
		})
	})
})

describe('Moveable Feasts - Data Integrity', () => {
	it('should have unique IDs for all moveable feasts', () => {
		const feasts = getMoveableFeastsForYear(2025)
		const ids = feasts.map((f) => f.id)
		const uniqueIds = new Set(ids)

		expect(uniqueIds.size).toBe(ids.length)
	})

	it('should mark all feasts as moveable', () => {
		const feasts = getMoveableFeastsForYear(2025)

		feasts.forEach((feast) => {
			expect(feast.isMoveable).toBe(true)
		})
	})

	it('should have valid feast types', () => {
		const feasts = getMoveableFeastsForYear(2025)
		const validTypes = ['majorFeast', 'minorFeast', 'fast']

		feasts.forEach((feast) => {
			expect(validTypes).toContain(feast.type)
		})
	})

	it('should return feasts in chronological order', () => {
		const feasts = getMoveableFeastsForYear(2025)

		for (let i = 1; i < feasts.length; i++) {
			expect(feasts[i].date.getTime()).toBeGreaterThanOrEqual(feasts[i - 1].date.getTime())
		}
	})
})
