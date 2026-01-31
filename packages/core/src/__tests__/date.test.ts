import { describe, expect, it } from 'vitest'
import { getMoveableFeastsForYear, isInMoveableFast } from '../calendar/moveable'
import { addDays, isSameDay, toMidnight } from '../utils/date'

/**
 * Comprehensive edge case tests for date handling
 * These tests verify DST safety, boundary conditions, and date arithmetic correctness
 */

describe('Date Edge Cases', () => {
	describe('DST Transitions', () => {
		// US DST 2025: Mar 9 (spring forward), Nov 2 (fall back)
		it('should handle spring forward correctly', () => {
			const march8 = new Date(2025, 2, 8) // Day before DST
			const result = addDays(march8, 1)
			expect(result.getDate()).toBe(9)
			expect(result.getMonth()).toBe(2)
		})

		it('should handle fall back correctly', () => {
			const nov1 = new Date(2025, 10, 1)
			const result = addDays(nov1, 1)
			expect(result.getDate()).toBe(2)
			expect(result.getMonth()).toBe(10)
		})

		it('should handle multi-day spans across spring DST', () => {
			const march1 = new Date(2025, 2, 1)
			const result = addDays(march1, 15) // Crosses DST
			expect(result.getDate()).toBe(16)
			expect(result.getMonth()).toBe(2)
		})

		it('should handle multi-day spans across fall DST', () => {
			const oct25 = new Date(2025, 9, 25)
			const result = addDays(oct25, 15) // Crosses DST
			expect(result.getDate()).toBe(9)
			expect(result.getMonth()).toBe(10)
		})

		it('should handle DST day itself (spring forward)', () => {
			// On March 9, 2025, 2:00 AM becomes 3:00 AM (23-hour day)
			const march9 = new Date(2025, 2, 9)
			const result = addDays(march9, 1)
			expect(result.getDate()).toBe(10)
			expect(result.getMonth()).toBe(2)
		})

		it('should handle DST day itself (fall back)', () => {
			// On Nov 2, 2025, 2:00 AM becomes 1:00 AM (25-hour day)
			const nov2 = new Date(2025, 10, 2)
			const result = addDays(nov2, 1)
			expect(result.getDate()).toBe(3)
			expect(result.getMonth()).toBe(10)
		})
	})

	describe('Midnight Boundaries', () => {
		it('should normalize 23:59:59 to same day as midnight', () => {
			const late = new Date(2025, 2, 15, 23, 59, 59)
			const midnight = new Date(2025, 2, 15, 0, 0, 0)
			expect(toMidnight(late)).toBe(toMidnight(midnight))
		})

		it('should normalize 00:00:01 to same day as midnight', () => {
			const early = new Date(2025, 2, 15, 0, 0, 1)
			const midnight = new Date(2025, 2, 15, 0, 0, 0)
			expect(toMidnight(early)).toBe(toMidnight(midnight))
		})

		it('should detect fasting at any time of day', () => {
			const times = [0, 6, 12, 18, 23]
			// March 15, 2025 is during Lent (Lent 2025: Feb 24 - April 19)

			times.forEach((hour) => {
				const date = new Date(2025, 2, 15, hour, 30, 0)
				const result = isInMoveableFast(date)
				expect(result?.name).toBe('Great Lent')
			})
		})

		it('should return correct midnight timestamp', () => {
			const date = new Date(2025, 5, 15, 14, 30, 45)
			const midnight = new Date(2025, 5, 15, 0, 0, 0)
			expect(toMidnight(date)).toBe(midnight.getTime())
		})

		it('should distinguish consecutive days at midnight boundary', () => {
			const endOfDay = new Date(2025, 5, 15, 23, 59, 59, 999)
			const startOfNextDay = new Date(2025, 5, 16, 0, 0, 0, 0)
			expect(toMidnight(endOfDay)).not.toBe(toMidnight(startOfNextDay))
		})
	})

	describe('Year Boundaries', () => {
		it('should handle Dec 31 -> Jan 1 transition', () => {
			const dec31 = new Date(2025, 11, 31)
			const result = addDays(dec31, 1)
			expect(result.getFullYear()).toBe(2026)
			expect(result.getMonth()).toBe(0)
			expect(result.getDate()).toBe(1)
		})

		it('should handle Jan 1 -> Dec 31 (negative days)', () => {
			const jan1 = new Date(2026, 0, 1)
			const result = addDays(jan1, -1)
			expect(result.getFullYear()).toBe(2025)
			expect(result.getMonth()).toBe(11)
			expect(result.getDate()).toBe(31)
		})

		it('should handle multiple year crossings forward', () => {
			const dec25 = new Date(2024, 11, 25)
			const result = addDays(dec25, 400) // Goes well into 2026
			expect(result.getFullYear()).toBe(2026)
		})

		it('should handle multiple year crossings backward', () => {
			const jan15 = new Date(2026, 0, 15)
			const result = addDays(jan15, -400) // Goes back to 2024
			expect(result.getFullYear()).toBe(2024)
		})

		it('should maintain date integrity across year boundary', () => {
			const dec30 = new Date(2025, 11, 30)
			const result = addDays(dec30, 5)
			expect(result.getFullYear()).toBe(2026)
			expect(result.getMonth()).toBe(0)
			expect(result.getDate()).toBe(4)
		})
	})

	describe('Leap Year Edge Cases', () => {
		it('should handle Feb 28 -> Feb 29 in leap year', () => {
			const feb28 = new Date(2024, 1, 28) // 2024 is leap year
			const result = addDays(feb28, 1)
			expect(result.getMonth()).toBe(1) // Still February
			expect(result.getDate()).toBe(29)
		})

		it('should handle Feb 28 -> Mar 1 in non-leap year', () => {
			const feb28 = new Date(2025, 1, 28) // 2025 is not leap year
			const result = addDays(feb28, 1)
			expect(result.getMonth()).toBe(2) // March
			expect(result.getDate()).toBe(1)
		})

		it('should handle Feb 29 -> Mar 1 in leap year', () => {
			const feb29 = new Date(2024, 1, 29)
			const result = addDays(feb29, 1)
			expect(result.getMonth()).toBe(2)
			expect(result.getDate()).toBe(1)
		})

		it('should handle century leap year rules (2000 is leap)', () => {
			// 2000 is leap (divisible by 400)
			const feb28_2000 = new Date(2000, 1, 28)
			const result = addDays(feb28_2000, 1)
			expect(result.getDate()).toBe(29)
			expect(result.getMonth()).toBe(1)
		})

		it('should handle leap year Feb 27 -> Mar 1 (3 days)', () => {
			const feb27 = new Date(2024, 1, 27)
			const result = addDays(feb27, 3)
			expect(result.getMonth()).toBe(2) // March
			expect(result.getDate()).toBe(1)
		})

		it('should handle non-leap year Feb 27 -> Mar 1 (2 days)', () => {
			const feb27 = new Date(2025, 1, 27)
			const result = addDays(feb27, 2)
			expect(result.getMonth()).toBe(2) // March
			expect(result.getDate()).toBe(1)
		})
	})

	describe('Large Day Offsets', () => {
		it('should handle 365 days (full non-leap year)', () => {
			const jan1 = new Date(2025, 0, 1)
			const result = addDays(jan1, 365)
			expect(result.getFullYear()).toBe(2026)
			expect(result.getMonth()).toBe(0)
			expect(result.getDate()).toBe(1)
		})

		it('should handle 366 days from start of leap year', () => {
			const jan1 = new Date(2024, 0, 1) // 2024 is leap year
			const result = addDays(jan1, 366)
			expect(result.getFullYear()).toBe(2025)
			expect(result.getMonth()).toBe(0)
			expect(result.getDate()).toBe(1)
		})

		it('should handle negative large offsets', () => {
			const dec31 = new Date(2025, 11, 31)
			const result = addDays(dec31, -365)
			// Dec 31, 2025 - 365 days = Dec 31, 2024
			expect(result.getFullYear()).toBe(2024)
			expect(result.getMonth()).toBe(11)
			expect(result.getDate()).toBe(31)
		})

		it('should handle 0 days (identity)', () => {
			const date = new Date(2025, 5, 15, 12, 30, 45)
			const result = addDays(date, 0)
			expect(result.getTime()).toBe(date.getTime())
		})

		it('should handle very large offsets (1000 days)', () => {
			const start = new Date(2025, 0, 1)
			const result = addDays(start, 1000)
			// 1000 days from Jan 1, 2025 should be around Sep 27, 2027
			expect(result.getFullYear()).toBe(2027)
		})

		it('should handle very large negative offsets (-1000 days)', () => {
			const start = new Date(2025, 0, 1)
			const result = addDays(start, -1000)
			// 1000 days before Jan 1, 2025 should be around Apr 7, 2022
			expect(result.getFullYear()).toBe(2022)
		})
	})

	describe('isSameDay Edge Cases', () => {
		it('should return true for same day different times', () => {
			const morning = new Date(2025, 5, 15, 6, 0, 0)
			const evening = new Date(2025, 5, 15, 22, 0, 0)
			expect(isSameDay(morning, evening)).toBe(true)
		})

		it('should return false for adjacent days at midnight boundary', () => {
			const late = new Date(2025, 5, 15, 23, 59, 59, 999)
			const early = new Date(2025, 5, 16, 0, 0, 0, 0)
			expect(isSameDay(late, early)).toBe(false)
		})

		it('should return true for exact same timestamp', () => {
			const date1 = new Date(2025, 5, 15, 12, 30, 45)
			const date2 = new Date(2025, 5, 15, 12, 30, 45)
			expect(isSameDay(date1, date2)).toBe(true)
		})

		it('should return false for same day different months', () => {
			const june15 = new Date(2025, 5, 15)
			const july15 = new Date(2025, 6, 15)
			expect(isSameDay(june15, july15)).toBe(false)
		})

		it('should return false for same day/month different years', () => {
			const june15_2025 = new Date(2025, 5, 15)
			const june15_2026 = new Date(2026, 5, 15)
			expect(isSameDay(june15_2025, june15_2026)).toBe(false)
		})

		it('should handle midnight exactly', () => {
			const midnight1 = new Date(2025, 5, 15, 0, 0, 0, 0)
			const midnight2 = new Date(2025, 5, 15, 0, 0, 0, 0)
			expect(isSameDay(midnight1, midnight2)).toBe(true)
		})

		it('should handle last millisecond of day', () => {
			const lastMs = new Date(2025, 5, 15, 23, 59, 59, 999)
			const firstMs = new Date(2025, 5, 15, 0, 0, 0, 0)
			expect(isSameDay(lastMs, firstMs)).toBe(true)
		})
	})

	describe('Moveable Feast Date Stability', () => {
		it('should calculate same feast dates regardless of input time', () => {
			const results = [2025, 2025, 2025].map((year) => getMoveableFeastsForYear(year))
			const easterDates = results.map(
				(r) => r.find((f) => f.name === 'Easter')?.date.getTime(),
			)

			// All should be identical
			expect(new Set(easterDates).size).toBe(1)
		})

		it('should maintain feast offset consistency across 10 years', () => {
			for (let year = 2020; year <= 2030; year++) {
				const feasts = getMoveableFeastsForYear(year)
				const easter = feasts.find((f) => f.name === 'Easter')!

				feasts.forEach((feast) => {
					const daysDiff = Math.round(
						(feast.date.getTime() - easter.date.getTime()) / (24 * 60 * 60 * 1000),
					)
					expect(daysDiff).toBe(feast.daysFromEaster)
				})
			}
		})

		it('should produce consistent results for Easter calculation', () => {
			// Easter 2025 should be April 20
			const feasts2025 = getMoveableFeastsForYear(2025)
			const easter2025 = feasts2025.find((f) => f.name === 'Easter')
			expect(easter2025?.date.getFullYear()).toBe(2025)
			expect(easter2025?.date.getMonth()).toBe(3) // April
			expect(easter2025?.date.getDate()).toBe(20)
		})

		it('should correctly offset Great Lent from Easter', () => {
			const feasts2025 = getMoveableFeastsForYear(2025)
			const easter = feasts2025.find((f) => f.name === 'Easter')!
			const lent = feasts2025.find((f) => f.name === 'Great Lent')!

			// Great Lent starts 55 days before Easter
			expect(lent.daysFromEaster).toBe(-55)

			const expectedLentStart = addDays(easter.date, -55)
			expect(isSameDay(lent.date, expectedLentStart)).toBe(true)
		})
	})

	describe('Month Boundary Edge Cases', () => {
		it('should handle 31-day to 30-day month transition', () => {
			const jan31 = new Date(2025, 0, 31) // January has 31 days
			const result = addDays(jan31, 1)
			expect(result.getMonth()).toBe(1) // February
			expect(result.getDate()).toBe(1)
		})

		it('should handle 30-day month end', () => {
			const apr30 = new Date(2025, 3, 30) // April has 30 days
			const result = addDays(apr30, 1)
			expect(result.getMonth()).toBe(4) // May
			expect(result.getDate()).toBe(1)
		})

		it('should handle negative day across month boundary', () => {
			const mar1 = new Date(2025, 2, 1)
			const result = addDays(mar1, -1)
			expect(result.getMonth()).toBe(1) // February
			expect(result.getDate()).toBe(28) // Non-leap year
		})

		it('should handle negative day across month boundary in leap year', () => {
			const mar1 = new Date(2024, 2, 1) // 2024 is leap year
			const result = addDays(mar1, -1)
			expect(result.getMonth()).toBe(1) // February
			expect(result.getDate()).toBe(29) // Leap year
		})
	})

	describe('addDays Preserves Time Component', () => {
		it('should preserve hours when adding days', () => {
			const date = new Date(2025, 5, 15, 14, 30, 45)
			const result = addDays(date, 5)
			expect(result.getHours()).toBe(14)
		})

		it('should preserve minutes when adding days', () => {
			const date = new Date(2025, 5, 15, 14, 30, 45)
			const result = addDays(date, 5)
			expect(result.getMinutes()).toBe(30)
		})

		it('should preserve seconds when adding days', () => {
			const date = new Date(2025, 5, 15, 14, 30, 45)
			const result = addDays(date, 5)
			expect(result.getSeconds()).toBe(45)
		})

		it('should preserve milliseconds when adding days', () => {
			const date = new Date(2025, 5, 15, 14, 30, 45, 123)
			const result = addDays(date, 5)
			expect(result.getMilliseconds()).toBe(123)
		})
	})

	describe('addDays Does Not Mutate Input', () => {
		it('should not modify the original date object', () => {
			const original = new Date(2025, 5, 15)
			const originalTime = original.getTime()
			addDays(original, 10)
			expect(original.getTime()).toBe(originalTime)
		})

		it('should return a new Date object', () => {
			const original = new Date(2025, 5, 15)
			const result = addDays(original, 0)
			expect(result).not.toBe(original)
		})
	})
})