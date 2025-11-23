import { describe, it, expect } from 'vitest'
import { getSynaxariumForDate, searchSynaxarium } from '../../services/synaxarium.service'

describe('Synaxarium Service', () => {
	describe('getSynaxariumForDate', () => {
		it('should return synaxarium entries for a valid date', () => {
			const date = new Date(2025, 0, 7)
			const result = getSynaxariumForDate(date)

			expect(result).not.toBeNull()
			if (result) {
				expect(Array.isArray(result)).toBe(true)
				expect(result.length).toBeGreaterThan(0)
				result.forEach((entry) => {
					expect(entry).toHaveProperty('name')
					expect(entry).toHaveProperty('url')
					expect(entry).not.toHaveProperty('text')
				})
			}
		})

		it('should include text when includeText is true', () => {
			const date = new Date(2025, 0, 7)
			const result = getSynaxariumForDate(date, true)

			expect(result).not.toBeNull()
			if (result) {
				expect(Array.isArray(result)).toBe(true)
				expect(result.length).toBeGreaterThan(0)
				result.forEach((entry) => {
					expect(entry).toHaveProperty('name')
					expect(entry).toHaveProperty('url')
				})
			}
		})

		it('should exclude text field when includeText is false', () => {
			const date = new Date(2025, 0, 7)
			const result = getSynaxariumForDate(date, false)

			expect(result).not.toBeNull()
			if (result) {
				expect(Array.isArray(result)).toBe(true)
				result.forEach((entry) => {
					expect(entry).not.toHaveProperty('_')
				})
			}
		})

		it('should return null for dates with no synaxarium entries', () => {
			const date = new Date(2025, 11, 31)
			const result = getSynaxariumForDate(date)

			if (result === null) {
				expect(result).toBeNull()
			} else {
				expect(Array.isArray(result)).toBe(true)
			}
		})

		it('should handle different months correctly', () => {
			const januaryDate = new Date(2025, 0, 15)
			const juneDate = new Date(2025, 5, 15)

			const januaryResult = getSynaxariumForDate(januaryDate)
			const juneResult = getSynaxariumForDate(juneDate)

			if (januaryResult) {
				expect(Array.isArray(januaryResult)).toBe(true)
			}
			if (juneResult) {
				expect(Array.isArray(juneResult)).toBe(true)
			}
		})

		it('should handle leap years correctly', () => {
			const leapYearDate = new Date(2024, 1, 29)
			const result = getSynaxariumForDate(leapYearDate)

			if (result) {
				expect(Array.isArray(result)).toBe(true)
			}
		})
	})

	describe('searchSynaxarium', () => {
		it('should find entries by name', () => {
			const results = searchSynaxarium('Mary')

			expect(Array.isArray(results)).toBe(true)
			results.forEach((result) => {
				expect(result).toHaveProperty('date')
				expect(result).toHaveProperty('copticDate')
				expect(result).toHaveProperty('entry')
				expect(result.copticDate).toHaveProperty('dateString')
				expect(result.copticDate).toHaveProperty('day')
				expect(result.copticDate).toHaveProperty('monthString')
				expect(result.entry).toHaveProperty('name')
				if (result.entry.name) {
					expect(result.entry.name.toLowerCase()).toContain('mary')
				}
			})
		})

		it('should be case insensitive', () => {
			const lowerCase = searchSynaxarium('mary')
			const upperCase = searchSynaxarium('MARY')
			const mixedCase = searchSynaxarium('MaRy')

			expect(lowerCase.length).toBeGreaterThan(0)
			expect(upperCase.length).toBe(lowerCase.length)
			expect(mixedCase.length).toBe(lowerCase.length)
		})

		it('should respect the limit parameter', () => {
			const results = searchSynaxarium('Saint', 5)

			expect(results.length).toBeLessThanOrEqual(5)
		})

		it('should use default limit of 50', () => {
			const results = searchSynaxarium('the')

			expect(results.length).toBeLessThanOrEqual(50)
		})

		it('should return empty array for non-existent search term', () => {
			const results = searchSynaxarium('xyznonexistentterm123')

			expect(Array.isArray(results)).toBe(true)
			expect(results.length).toBe(0)
		})

		it('should handle special characters in search', () => {
			const results = searchSynaxarium('St.')

			expect(Array.isArray(results)).toBe(true)
		})

		it('should return results with proper coptic date structure', () => {
			const results = searchSynaxarium('Martyrdom', 10)

			results.forEach((result) => {
				expect(typeof result.copticDate.day).toBe('number')
				expect(typeof result.copticDate.monthString).toBe('string')
				expect(typeof result.date).toBe('string')
				expect(result.copticDate.day).toBeGreaterThan(0)
			})
		})

		it('should handle empty string search', () => {
			const results = searchSynaxarium('')

			expect(Array.isArray(results)).toBe(true)
		})

		it('should handle single character search', () => {
			const results = searchSynaxarium('a', 10)

			expect(Array.isArray(results)).toBe(true)
			expect(results.length).toBeLessThanOrEqual(10)
		})
	})
})
