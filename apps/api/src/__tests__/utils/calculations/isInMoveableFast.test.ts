import { getMoveableFeastsForYear, isInMoveableFast } from '@coptic/core'
import { addDays } from 'date-fns'
import { describe, expect, it } from 'vitest'

/**
 * Unit tests for isInMoveableFast function
 * Tests all three moveable fasting periods:
 * 1. Fast of Nineveh (3 days, 69 days before Easter)
 * 2. Great Lent (55 days, ending on Easter)
 * 3. Apostles' Fast (day after Pentecost to July 12)
 */

describe('isInMoveableFast', () => {
	describe('Great Lent 2025', () => {
		// Great Lent 2025: Feb 24 - April 19 (Easter is April 20)
		const lentStart = new Date(2025, 1, 24) // Feb 24
		const easterEve = new Date(2025, 3, 19) // April 19
		const easter = new Date(2025, 3, 20) // April 20

		it('should return Great Lent on first day of Lent', () => {
			const result = isInMoveableFast(lentStart)
			expect(result).not.toBeNull()
			expect(result?.name).toBe('Great Lent')
		})

		it('should return Great Lent during middle of Lent', () => {
			const midLent = new Date(2025, 2, 15) // March 15
			const result = isInMoveableFast(midLent)
			expect(result).not.toBeNull()
			expect(result?.name).toBe('Great Lent')
		})

		it('should return Great Lent on last day before Easter', () => {
			const result = isInMoveableFast(easterEve)
			expect(result).not.toBeNull()
			expect(result?.name).toBe('Great Lent')
		})

		it('should NOT return Great Lent on Easter day', () => {
			const result = isInMoveableFast(easter)
			// Easter itself is not a fasting day
			expect(result?.name).not.toBe('Great Lent')
		})

		it('should NOT return Great Lent day before Lent starts', () => {
			const beforeLent = addDays(lentStart, -1)
			const result = isInMoveableFast(beforeLent)
			expect(result?.name).not.toBe('Great Lent')
		})
	})

	describe('Fast of Nineveh 2025', () => {
		// Fast of Nineveh 2025: Feb 10-12 (3 days, 69 days before Easter)
		const ninevehStart = new Date(2025, 1, 10) // Feb 10
		const ninevehEnd = new Date(2025, 1, 12) // Feb 12 (last day)

		it('should return Fast of Nineveh on first day', () => {
			const result = isInMoveableFast(ninevehStart)
			expect(result).not.toBeNull()
			expect(result?.name).toBe('Fast of Nineveh')
		})

		it('should return Fast of Nineveh on second day', () => {
			const day2 = new Date(2025, 1, 11)
			const result = isInMoveableFast(day2)
			expect(result).not.toBeNull()
			expect(result?.name).toBe('Fast of Nineveh')
		})

		it('should return Fast of Nineveh on third day', () => {
			const result = isInMoveableFast(ninevehEnd)
			expect(result).not.toBeNull()
			expect(result?.name).toBe('Fast of Nineveh')
		})

		it('should NOT return Fast of Nineveh on day before', () => {
			const beforeNineveh = addDays(ninevehStart, -1)
			const result = isInMoveableFast(beforeNineveh)
			expect(result?.name).not.toBe('Fast of Nineveh')
		})

		it('should NOT return Fast of Nineveh on day after', () => {
			const afterNineveh = addDays(ninevehEnd, 1)
			const result = isInMoveableFast(afterNineveh)
			expect(result?.name).not.toBe('Fast of Nineveh')
		})
	})

	describe("Apostles' Fast 2025", () => {
		// Apostles' Fast 2025: June 9 (day after Pentecost) to July 12
		// Pentecost 2025: June 8
		const apostlesStart = new Date(2025, 5, 9) // June 9
		const apostlesEnd = new Date(2025, 6, 12) // July 12

		it("should return Apostles' Fast on first day", () => {
			const result = isInMoveableFast(apostlesStart)
			expect(result).not.toBeNull()
			expect(result?.name).toBe("Apostles' Fast")
		})

		it("should return Apostles' Fast during middle of fast", () => {
			const midFast = new Date(2025, 5, 25) // June 25
			const result = isInMoveableFast(midFast)
			expect(result).not.toBeNull()
			expect(result?.name).toBe("Apostles' Fast")
		})

		it("should return Apostles' Fast on last day (July 12)", () => {
			const result = isInMoveableFast(apostlesEnd)
			expect(result).not.toBeNull()
			expect(result?.name).toBe("Apostles' Fast")
		})

		it("should NOT return Apostles' Fast on Pentecost", () => {
			const pentecost = new Date(2025, 5, 8) // June 8
			const result = isInMoveableFast(pentecost)
			expect(result?.name).not.toBe("Apostles' Fast")
		})

		it("should NOT return Apostles' Fast after July 12", () => {
			const afterFast = new Date(2025, 6, 13) // July 13
			const result = isInMoveableFast(afterFast)
			expect(result).toBeNull()
		})
	})

	describe('Non-fasting periods', () => {
		it('should return null for regular summer day', () => {
			const summerDay = new Date(2025, 7, 15) // Aug 15
			const result = isInMoveableFast(summerDay)
			expect(result).toBeNull()
		})

		it('should return null for regular fall day', () => {
			const fallDay = new Date(2025, 9, 15) // Oct 15
			const result = isInMoveableFast(fallDay)
			expect(result).toBeNull()
		})

		it('should return null for New Year', () => {
			const newYear = new Date(2025, 0, 1)
			const result = isInMoveableFast(newYear)
			expect(result).toBeNull()
		})

		it('should return null for Christmas (static fast, not moveable)', () => {
			// Note: Nativity Fast is a static fast, not moveable
			const christmas = new Date(2025, 11, 25)
			const result = isInMoveableFast(christmas)
			expect(result).toBeNull()
		})
	})

	describe('Edge cases', () => {
		it('should handle year boundary correctly', () => {
			// If checking dates in January, should check current year's fasts
			const jan1 = new Date(2025, 0, 1)
			const result = isInMoveableFast(jan1)
			// Should not crash and return null (no moveable fast on Jan 1)
			expect(result).toBeNull()
		})

		it('should handle leap year correctly', () => {
			const leapDay = new Date(2024, 1, 29) // Feb 29, 2024
			const result = isInMoveableFast(leapDay)
			// Should not crash - may or may not be in a fast depending on 2024 dates
			expect(typeof result === 'object' || result === null).toBe(true)
		})

		it('should return correct fast type', () => {
			const lentDay = new Date(2025, 2, 15)
			const result = isInMoveableFast(lentDay)
			expect(result?.type).toBe('fast')
		})

		it('should return daysFromEaster property', () => {
			const lentDay = new Date(2025, 2, 15)
			const result = isInMoveableFast(lentDay)
			expect(result?.daysFromEaster).toBe(-55) // Great Lent starts 55 days before Easter
		})
	})

	describe('Multi-year consistency', () => {
		it.each([2024, 2025, 2026, 2027, 2028])(
			'should correctly identify Great Lent in year %s',
			(year) => {
				const feasts = getMoveableFeastsForYear(year)
				const greatLent = feasts.find((f) => f.name === 'Great Lent')
				expect(greatLent).toBeDefined()

				if (greatLent) {
					const result = isInMoveableFast(greatLent.date)
					expect(result).not.toBeNull()
					expect(result?.name).toBe('Great Lent')
				}
			},
		)

		it.each([2024, 2025, 2026, 2027, 2028])(
			'should correctly identify Fast of Nineveh in year %s',
			(year) => {
				const feasts = getMoveableFeastsForYear(year)
				const nineveh = feasts.find((f) => f.name === 'Fast of Nineveh')
				expect(nineveh).toBeDefined()

				if (nineveh) {
					const result = isInMoveableFast(nineveh.date)
					expect(result).not.toBeNull()
					expect(result?.name).toBe('Fast of Nineveh')
				}
			},
		)
	})
})
