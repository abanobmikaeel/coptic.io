import { describe, expect, it } from 'vitest'
import { calculateEaster } from '../calendar/pascha'

const iso = (year: number) => {
	const easter = calculateEaster(year)
	return `${easter.year}-${String(easter.month).padStart(2, '0')}-${String(easter.day).padStart(2, '0')}`
}

describe('calculateEaster', () => {
	// Observed Orthodox Pascha dates, spanning both the March/April and the
	// April/May ends of the range and a year where the Julian date rolls over
	// into the next Gregorian month.
	it.each([
		[2021, '2021-05-02'],
		[2022, '2022-04-24'],
		[2023, '2023-04-16'],
		[2024, '2024-05-05'],
		[2025, '2025-04-20'],
		[2026, '2026-04-12'],
	])('matches the observed Pascha for %i', (year, expected) => {
		expect(iso(year)).toBe(expected)
	})

	// The Julian/Gregorian gap widens by a day in 2100 and again in 2200. The old
	// implementation hardcoded a single "+1 after 2099" step, so it was correct
	// only between 1900 and 2199; deriving the offset removes the cliff.
	it('stays correct across the century steps that used to bound it', () => {
		// 2099-2199 cross-checked against the previous implementation, which was
		// correct inside its window. 2200 is where that one silently lost a day:
		// it returned April 5, which is not a Sunday and so cannot be Pascha.
		expect(iso(2099)).toBe('2099-04-12')
		expect(iso(2100)).toBe('2100-05-02')
		expect(iso(2199)).toBe('2199-04-21')
		expect(iso(2200)).toBe('2200-04-06')
	})

	it('computes years outside the old 1900-2199 window without throwing', () => {
		expect(() => calculateEaster(1583)).not.toThrow()
		expect(() => calculateEaster(9999)).not.toThrow()
		expect(iso(1800)).toBe('1800-04-20')
		expect(iso(1899)).toBe('1899-04-30')
	})

	it('always lands on a Sunday, in every century', () => {
		for (const year of [1600, 1700, 1900, 2000, 2025, 2100, 2200, 2500, 3000]) {
			const { year: y, month, day } = calculateEaster(year)
			expect(new Date(y, month - 1, day).getDay(), `${year} is not a Sunday`).toBe(0)
		}
	})

	it('returns a date in the year it was asked for', () => {
		for (let year = 1583; year <= 2600; year++) {
			const easter = calculateEaster(year)
			expect(easter.year).toBe(year)
			expect(easter.month).toBeGreaterThanOrEqual(3)
			expect(easter.month).toBeLessThanOrEqual(6)
			expect(easter.day).toBeGreaterThanOrEqual(1)
			expect(easter.day).toBeLessThanOrEqual(31)
		}
	})
})
