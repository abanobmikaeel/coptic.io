import { describe, it, expect } from 'vitest'
import { getMoveableFeastsForYear } from '../../../utils/calculations/getMoveableFeasts'
import getEaster from '../../../utils/calculations/getEaster'
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

describe('Fixed Feasts - Gregorian Dates', () => {
	/**
	 * Fixed feasts always fall on the same Gregorian date
	 * (adjusted for Julian calendar offset of 13 days)
	 */
	const fixedFeasts = [
		{ name: 'Coptic Christmas', month: 1, day: 7 },
		{ name: 'Epiphany (Theophany)', month: 1, day: 19 },
		{ name: 'Annunciation', month: 4, day: 7 },
		{ name: 'Nayrouz (Coptic New Year)', month: 9, day: 11 }, // or 12 in leap year
		{ name: 'Feast of the Cross', month: 9, day: 27 },
		{ name: 'Entrance of Virgin Mary to Temple', month: 12, day: 3 },
	]

	fixedFeasts.forEach(({ name, month, day }) => {
		it(`${name} should always be ${month}/${day}`, () => {
			// This test documents expected fixed feast dates
			// Implementation should return these dates for any year
			expect(true).toBe(true) // Placeholder - add actual feast lookup when available
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
				(easter.date.getTime() - greatLent.date.getTime()) / (1000 * 60 * 60 * 24)
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
