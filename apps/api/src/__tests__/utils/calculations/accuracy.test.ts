import { describe, expect, it } from 'vitest'
import getEaster from '../../../utils/calculations/getEaster'
import { getAllSeasonsForYear } from '../../../utils/calculations/getLiturgicalSeason'
import { getMoveableFeastsForYear } from '../../../utils/calculations/getMoveableFeasts'
import { getStaticCelebrationsForDay } from '../../../utils/calculations/getStaticCelebrations'
import fromGregorian from '../../../utils/copticDate'

/**
 * ACCURACY TESTS - North Star for Coptic Calendar
 *
 * These tests validate exact dates against authoritative sources.
 * Sources:
 * - https://www.copticchurch.net/calendar
 * - https://suscopts.org/resources/
 * - https://st-takla.org/
 *
 * If any of these tests fail, it indicates a critical accuracy issue
 * that must be fixed before deployment.
 */

describe('Easter (Pascha) - Exact Dates', () => {
	/**
	 * Orthodox/Coptic Easter dates verified against multiple sources:
	 * - https://www.copticchurch.net/calendar
	 * - https://orthodoxwiki.org/Pascha
	 */
	const knownEasterDates: Array<{ year: number; month: number; day: number }> = [
		{ year: 2020, month: 4, day: 19 }, // April 19, 2020
		{ year: 2021, month: 5, day: 2 }, // May 2, 2021
		{ year: 2022, month: 4, day: 24 }, // April 24, 2022
		{ year: 2023, month: 4, day: 16 }, // April 16, 2023
		{ year: 2024, month: 5, day: 5 }, // May 5, 2024
		{ year: 2025, month: 4, day: 20 }, // April 20, 2025
		{ year: 2026, month: 4, day: 12 }, // April 12, 2026
		{ year: 2027, month: 5, day: 2 }, // May 2, 2027
		{ year: 2028, month: 4, day: 16 }, // April 16, 2028
		{ year: 2029, month: 4, day: 8 }, // April 8, 2029
		{ year: 2030, month: 4, day: 28 }, // April 28, 2030
	]

	knownEasterDates.forEach(({ year, month, day }) => {
		it(`Easter ${year} should be ${month}/${day}/${year}`, () => {
			const easter = getEaster(year)
			expect(easter.year).toBe(year)
			expect(easter.month).toBe(month)
			expect(easter.day).toBe(day)
		})
	})
})

describe('Coptic Date Conversion - Exact Dates', () => {
	/**
	 * Known Coptic-Gregorian date conversions
	 * Verified against: https://www.copticchurch.net/calendar
	 */
	const knownConversions: Array<{
		gregorian: { year: number; month: number; day: number }
		coptic: { day: number; month: number; year: number; monthString: string }
	}> = [
		// Coptic New Year (Nayrouz) - Tout 1
		{
			gregorian: { year: 2024, month: 9, day: 11 },
			coptic: { day: 1, month: 1, year: 1741, monthString: 'Tout' },
		},
		// Christmas Eve - Kiahk 28
		{
			gregorian: { year: 2025, month: 1, day: 6 },
			coptic: { day: 28, month: 4, year: 1741, monthString: 'Kiahk' },
		},
		// Coptic Christmas - Kiahk 29
		{
			gregorian: { year: 2025, month: 1, day: 7 },
			coptic: { day: 29, month: 4, year: 1741, monthString: 'Kiahk' },
		},
		// Epiphany - Tobi 11
		{
			gregorian: { year: 2025, month: 1, day: 19 },
			coptic: { day: 11, month: 5, year: 1741, monthString: 'Toba' },
		},
		// Annunciation - Baramhat 29 (also spelled Paremhat)
		{
			gregorian: { year: 2025, month: 4, day: 7 },
			coptic: { day: 29, month: 7, year: 1741, monthString: 'Baramhat' },
		},
		// Feast of the Cross - Tout 17
		{
			gregorian: { year: 2024, month: 9, day: 27 },
			coptic: { day: 17, month: 1, year: 1741, monthString: 'Tout' },
		},
		// Random date validation
		{
			gregorian: { year: 2025, month: 1, day: 15 },
			coptic: { day: 7, month: 5, year: 1741, monthString: 'Toba' },
		},
		// Leap year date (Feb 29)
		{
			gregorian: { year: 2024, month: 2, day: 29 },
			coptic: { day: 21, month: 6, year: 1740, monthString: 'Amshir' },
		},
	]

	knownConversions.forEach(({ gregorian, coptic }) => {
		const gregStr = `${gregorian.month}/${gregorian.day}/${gregorian.year}`
		const copticStr = `${coptic.monthString} ${coptic.day}, ${coptic.year}`

		it(`${gregStr} should be ${copticStr}`, () => {
			const date = new Date(gregorian.year, gregorian.month - 1, gregorian.day)
			const result = fromGregorian(date)

			expect(result.day).toBe(coptic.day)
			expect(result.month).toBe(coptic.month)
			expect(result.year).toBe(coptic.year)
			expect(result.monthString).toBe(coptic.monthString)
		})
	})
})

describe('Moveable Feasts - Multi-Year Exact Dates', () => {
	/**
	 * Exact dates for major moveable feasts across multiple years
	 * All dates derived from Easter using fixed offsets
	 */

	// 2024 Official dates
	describe('2024 Moveable Feasts', () => {
		const feasts2024 = getMoveableFeastsForYear(2024)

		it('Easter 2024 should be May 5', () => {
			const easter = feasts2024.find((f) => f.name === 'Easter')
			expect(easter?.date.getMonth()).toBe(4) // May (0-indexed)
			expect(easter?.date.getDate()).toBe(5)
		})

		it('Palm Sunday 2024 should be April 28', () => {
			const palmSunday = feasts2024.find((f) => f.name === 'Palm Sunday')
			expect(palmSunday?.date.getMonth()).toBe(3) // April
			expect(palmSunday?.date.getDate()).toBe(28)
		})

		it('Good Friday 2024 should be May 3', () => {
			const goodFriday = feasts2024.find((f) => f.name === 'Good Friday')
			expect(goodFriday?.date.getMonth()).toBe(4) // May
			expect(goodFriday?.date.getDate()).toBe(3)
		})

		it('Pentecost 2024 should be June 23', () => {
			const pentecost = feasts2024.find((f) => f.name === 'Pentecost')
			expect(pentecost?.date.getMonth()).toBe(5) // June
			expect(pentecost?.date.getDate()).toBe(23)
		})
	})

	// 2026 Official dates
	describe('2026 Moveable Feasts', () => {
		const feasts2026 = getMoveableFeastsForYear(2026)

		it('Easter 2026 should be April 12', () => {
			const easter = feasts2026.find((f) => f.name === 'Easter')
			expect(easter?.date.getMonth()).toBe(3) // April
			expect(easter?.date.getDate()).toBe(12)
		})

		it('Palm Sunday 2026 should be April 5', () => {
			const palmSunday = feasts2026.find((f) => f.name === 'Palm Sunday')
			expect(palmSunday?.date.getMonth()).toBe(3) // April
			expect(palmSunday?.date.getDate()).toBe(5)
		})

		it('Good Friday 2026 should be April 10', () => {
			const goodFriday = feasts2026.find((f) => f.name === 'Good Friday')
			expect(goodFriday?.date.getMonth()).toBe(3) // April
			expect(goodFriday?.date.getDate()).toBe(10)
		})

		it('Pentecost 2026 should be May 31', () => {
			const pentecost = feasts2026.find((f) => f.name === 'Pentecost')
			expect(pentecost?.date.getMonth()).toBe(4) // May
			expect(pentecost?.date.getDate()).toBe(31)
		})
	})

	// 2027 Official dates
	describe('2027 Moveable Feasts', () => {
		const feasts2027 = getMoveableFeastsForYear(2027)

		it('Easter 2027 should be May 2', () => {
			const easter = feasts2027.find((f) => f.name === 'Easter')
			expect(easter?.date.getMonth()).toBe(4) // May
			expect(easter?.date.getDate()).toBe(2)
		})

		it('Palm Sunday 2027 should be April 25', () => {
			const palmSunday = feasts2027.find((f) => f.name === 'Palm Sunday')
			expect(palmSunday?.date.getMonth()).toBe(3) // April
			expect(palmSunday?.date.getDate()).toBe(25)
		})
	})
})

describe('Fixed Feasts - Gregorian Lookup', () => {
	/**
	 * Fixed feasts verified via getStaticCelebrationsForDay()
	 * Source: https://st-takla.org/faith/en/terms/feasts.html
	 */

	it('January 7 should return Nativity Feast', () => {
		const celebrations = getStaticCelebrationsForDay(new Date(2025, 0, 7))
		expect(celebrations).not.toBeNull()
		expect(celebrations?.some((c) => c.name.includes('Nativity'))).toBe(true)
	})

	it('January 19 should return Theophany Feast', () => {
		const celebrations = getStaticCelebrationsForDay(new Date(2025, 0, 19))
		expect(celebrations).not.toBeNull()
		expect(celebrations?.some((c) => c.name.includes('Theophany'))).toBe(true)
	})

	it('September 11 should return Nayrouz', () => {
		const celebrations = getStaticCelebrationsForDay(new Date(2024, 8, 11))
		expect(celebrations).not.toBeNull()
		expect(celebrations?.some((c) => c.name.includes('Nayrouz'))).toBe(true)
	})

	it('September 27 should return Feast of the Cross', () => {
		const celebrations = getStaticCelebrationsForDay(new Date(2024, 8, 27))
		expect(celebrations).not.toBeNull()
		expect(celebrations?.some((c) => c.name.includes('Cross'))).toBe(true)
	})

	it('April 7 should return Annunciation', () => {
		const celebrations = getStaticCelebrationsForDay(new Date(2025, 3, 7))
		expect(celebrations).not.toBeNull()
		expect(celebrations?.some((c) => c.name.includes('Annunciation'))).toBe(true)
	})

	it('all fixed feast lookups should be non-moveable', () => {
		const feastDates = [
			new Date(2025, 0, 7), // Nativity
			new Date(2025, 0, 19), // Theophany
			new Date(2024, 8, 11), // Nayrouz
			new Date(2024, 8, 27), // Cross
		]

		feastDates.forEach((date) => {
			const celebrations = getStaticCelebrationsForDay(date)
			celebrations?.forEach((c) => {
				expect(c.isMoveable).toBe(false)
			})
		})
	})
})

describe('Fasting Periods - Date Ranges', () => {
	/**
	 * Validate fasting period start and end dates
	 */

	it('Great Lent 2025 should start February 24', () => {
		const feasts = getMoveableFeastsForYear(2025)
		const greatLent = feasts.find((f) => f.name === 'Great Lent')

		expect(greatLent?.date.getMonth()).toBe(1) // February
		expect(greatLent?.date.getDate()).toBe(24)
	})

	it('Great Lent 2025 should be 55 days before Easter', () => {
		const feasts = getMoveableFeastsForYear(2025)
		const easter = feasts.find((f) => f.name === 'Easter')
		const greatLent = feasts.find((f) => f.name === 'Great Lent')

		if (easter && greatLent) {
			const diff = Math.round(
				(easter.date.getTime() - greatLent.date.getTime()) / (1000 * 60 * 60 * 24),
			)
			expect(diff).toBe(55)
		}
	})

	it('Fast of Nineveh 2025 should start February 10 (3 days)', () => {
		const feasts = getMoveableFeastsForYear(2025)
		const nineveh = feasts.find((f) => f.name === 'Fast of Nineveh')

		expect(nineveh?.date.getMonth()).toBe(1) // February
		expect(nineveh?.date.getDate()).toBe(10)
	})
})

describe('Fixed Feasts - Coptic Date Mapping', () => {
	/**
	 * Verify fixed feasts fall on the correct Coptic calendar dates
	 * Source: https://st-takla.org/faith/en/terms/feasts.html
	 *
	 * Major Fixed: Annunciation (29 Baramhat), Nativity (29 Kiahk), Theophany (11 Toba)
	 * Minor Fixed: Circumcision (6 Toba), Entry into Temple (8 Amshir),
	 *              Flight to Egypt (24 Bashans), Cana (13 Toba), Transfiguration (13 Mesra)
	 */
	const fixedFeastCopticDates = [
		// Major Fixed Feasts
		{ name: 'Nativity', gregMonth: 1, gregDay: 7, copticMonth: 'Kiahk', copticDay: 29 },
		{ name: 'Theophany', gregMonth: 1, gregDay: 19, copticMonth: 'Toba', copticDay: 11 },
		{ name: 'Annunciation', gregMonth: 4, gregDay: 7, copticMonth: 'Baramhat', copticDay: 29 },
		// Minor Fixed Feasts
		{ name: 'Circumcision', gregMonth: 1, gregDay: 14, copticMonth: 'Toba', copticDay: 6 },
		{ name: 'Entry into Temple', gregMonth: 2, gregDay: 15, copticMonth: 'Amshir', copticDay: 8 },
		{ name: 'Cana', gregMonth: 1, gregDay: 21, copticMonth: 'Toba', copticDay: 13 },
		{ name: 'Transfiguration', gregMonth: 8, gregDay: 19, copticMonth: 'Mesra', copticDay: 13 },
		// Other notable fixed dates
		{ name: 'Nayrouz', gregMonth: 9, gregDay: 11, copticMonth: 'Tout', copticDay: 1 },
		{ name: 'Feast of the Cross', gregMonth: 9, gregDay: 27, copticMonth: 'Tout', copticDay: 17 },
	]

	fixedFeastCopticDates.forEach(({ name, gregMonth, gregDay, copticMonth, copticDay }) => {
		it(`${name} (${gregMonth}/${gregDay}) should be ${copticMonth} ${copticDay}`, () => {
			// Use 2025 for non-leap year (2024 for Sep dates since those are AM 1741 Tout)
			const year = gregMonth >= 9 ? 2024 : 2025
			const date = new Date(year, gregMonth - 1, gregDay)
			const coptic = fromGregorian(date)

			expect(coptic.monthString).toBe(copticMonth)
			expect(coptic.day).toBe(copticDay)
		})
	})
})

describe('Coptic Date Conversion - Month Boundaries', () => {
	/**
	 * Verify conversions at Coptic month boundaries
	 * Each Coptic month (1-12) has exactly 30 days, Nasie has 5 (or 6 in leap year)
	 */

	it('should convert all 13 Coptic month names correctly', () => {
		// First day of each Coptic month in AM 1741 (Gregorian dates)
		// Computed from Tout 1 = Sept 11, 2024, each month = 30 days
		// Month names as returned by Intl.DateTimeFormat('en-u-ca-coptic')
		// Note: some differ from dayReadings.json transliterations
		// (e.g. Intl: Hator vs data: Hatoor, Intl: Paona vs data: Baona)
		const monthFirstDays: Array<{ month: string; greg: [number, number, number] }> = [
			{ month: 'Tout', greg: [2024, 8, 11] }, // Sept 11
			{ month: 'Baba', greg: [2024, 9, 11] }, // Oct 11
			{ month: 'Hator', greg: [2024, 10, 10] }, // Nov 10
			{ month: 'Kiahk', greg: [2024, 11, 10] }, // Dec 10
			{ month: 'Toba', greg: [2025, 0, 9] }, // Jan 9
			{ month: 'Amshir', greg: [2025, 1, 8] }, // Feb 8
			{ month: 'Baramhat', greg: [2025, 2, 10] }, // Mar 10
			{ month: 'Baramouda', greg: [2025, 3, 9] }, // Apr 9
			{ month: 'Bashans', greg: [2025, 4, 9] }, // May 9
			{ month: 'Paona', greg: [2025, 5, 8] }, // Jun 8
			{ month: 'Epep', greg: [2025, 6, 8] }, // Jul 8
			{ month: 'Mesra', greg: [2025, 7, 7] }, // Aug 7
			{ month: 'Nasie', greg: [2025, 8, 6] }, // Sept 6
		]

		monthFirstDays.forEach(({ month, greg }) => {
			const date = new Date(greg[0], greg[1], greg[2])
			const coptic = fromGregorian(date)
			expect(coptic.monthString).toBe(month)
			expect(coptic.day).toBe(1)
		})
	})

	it('Tout 30 should be the day before Baba 1', () => {
		// Tout 30 = Sept 11 + 29 days = Oct 10, 2024
		const tout30 = fromGregorian(new Date(2024, 9, 10))
		expect(tout30.monthString).toBe('Tout')
		expect(tout30.day).toBe(30)

		// Baba 1 = Oct 11, 2024
		const baba1 = fromGregorian(new Date(2024, 9, 11))
		expect(baba1.monthString).toBe('Baba')
		expect(baba1.day).toBe(1)
	})

	it('Nasie should have 5 or 6 days depending on Coptic leap year', () => {
		// Nasie starts after Mesra 30
		// In non-leap year (2025): Nasie has 5 days (Sept 6-10, 2025)
		const nasie1 = fromGregorian(new Date(2025, 8, 6))
		expect(nasie1.monthString).toBe('Nasie')
		expect(nasie1.day).toBe(1)

		const nasie5 = fromGregorian(new Date(2025, 8, 10))
		expect(nasie5.monthString).toBe('Nasie')
		expect(nasie5.day).toBe(5)

		// Next day should be Tout 1 of the new year
		const newYear = fromGregorian(new Date(2025, 8, 11))
		expect(newYear.monthString).toBe('Tout')
		expect(newYear.day).toBe(1)
	})

	it('Coptic year should transition correctly at Nayrouz', () => {
		// Nasie 5, 1741 = Sept 10, 2025
		const lastDay = fromGregorian(new Date(2025, 8, 10))
		expect(lastDay.year).toBe(1741)

		// Tout 1, 1742 = Sept 11, 2025
		const firstDay = fromGregorian(new Date(2025, 8, 11))
		expect(firstDay.year).toBe(1742)
		expect(firstDay.monthString).toBe('Tout')
		expect(firstDay.day).toBe(1)
	})
})

describe('Liturgical Season Durations', () => {
	/**
	 * Verify exact period lengths for liturgical seasons
	 * Source: Coptic Orthodox Church tradition
	 */
	const daysBetween = (a: Date, b: Date) =>
		Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))

	const testYears = [2025, 2026, 2027]

	testYears.forEach((year) => {
		describe(`${year}`, () => {
			const seasons = getAllSeasonsForYear(year)
			const feasts = getMoveableFeastsForYear(year)

			it('Great Lent should be 55 days (start to Easter eve)', () => {
				const greatLent = seasons.find((s) => s.name === 'Great Lent')
				expect(greatLent).toBeDefined()
				if (greatLent) {
					// Great Lent start to end (day before Easter) inclusive = 55 days
					const duration = daysBetween(greatLent.startDate, greatLent.endDate) + 1
					expect(duration).toBe(55)
				}
			})

			it('Holy Week should be 7 days (Palm Sunday to Holy Saturday)', () => {
				const holyWeek = seasons.find((s) => s.name === 'Holy Week')
				expect(holyWeek).toBeDefined()
				if (holyWeek) {
					const duration = daysBetween(holyWeek.startDate, holyWeek.endDate) + 1
					expect(duration).toBe(7)
				}
			})

			it('Paschal Season should be 50 days (Easter to Pentecost)', () => {
				const paschal = seasons.find(
					(s) => s.name === 'Paschal Season' && s.startDate.getFullYear() === year,
				)
				expect(paschal).toBeDefined()
				if (paschal) {
					const duration = daysBetween(paschal.startDate, paschal.endDate) + 1
					expect(duration).toBe(50)
				}
			})

			it('Fast of Nineveh should be 3 days', () => {
				const nineveh = seasons.find((s) => s.name === 'Fast of Nineveh')
				expect(nineveh).toBeDefined()
				if (nineveh) {
					const duration = daysBetween(nineveh.startDate, nineveh.endDate) + 1
					expect(duration).toBe(3)
				}
			})

			it("Apostles' Fast should always end on July 12", () => {
				const apostles = seasons.find((s) => s.name === "Apostles' Fast")
				expect(apostles).toBeDefined()
				if (apostles) {
					expect(apostles.endDate.getMonth()).toBe(6) // July (0-indexed)
					expect(apostles.endDate.getDate()).toBe(12)
				}
			})

			it('Paschal Season should NOT be a fasting period', () => {
				const paschal = seasons.find(
					(s) => s.name === 'Paschal Season' && s.startDate.getFullYear() === year,
				)
				expect(paschal?.isFasting).toBe(false)
			})
		})
	})

	it('Nativity Fast should be 43 days (Nov 25 to Jan 6)', () => {
		const seasons = getAllSeasonsForYear(2025)
		const nativity = seasons.find(
			(s) => s.name === 'Nativity Fast' && s.startDate.getFullYear() === 2025,
		)
		expect(nativity).toBeDefined()
		if (nativity) {
			const duration = daysBetween(nativity.startDate, nativity.endDate) + 1
			expect(duration).toBe(43)
		}
	})
})
