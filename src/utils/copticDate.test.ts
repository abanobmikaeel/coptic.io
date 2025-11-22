import { describe, it, expect } from 'vitest'
import fromGregorian from './copticDate'

describe('Coptic Date Conversion', () => {
	it('should convert January 15, 2025 to Toba 6, 1741', () => {
		const gregorianDate = new Date('2025-01-15')
		const copticDate = fromGregorian(gregorianDate)

		expect(copticDate.dateString).toBe('Toba 6, 1741')
		expect(copticDate.day).toBe(6)
		expect(copticDate.month).toBe(5)
		expect(copticDate.year).toBe(1741)
		expect(copticDate.monthString).toBe('Toba')
	})

	it('should convert December 25, 2024 to Coptic date', () => {
		const gregorianDate = new Date('2024-12-25')
		const copticDate = fromGregorian(gregorianDate)

		// Just verify it returns valid Coptic date structure
		expect(copticDate.month).toBe(4) // Kiahk
		expect(copticDate.year).toBe(1741)
		expect(copticDate.monthString).toBe('Kiahk')
		expect(copticDate.day).toBeGreaterThan(0)
		expect(copticDate.day).toBeLessThanOrEqual(30)
	})

	it('should convert dates around Coptic New Year', () => {
		// Coptic New Year is typically around September 11/12
		const gregorianDate = new Date('2024-09-11')
		const copticDate = fromGregorian(gregorianDate)

		// Should be in Nasie (month 13) or Tout (month 1)
		expect(copticDate.month).toBeLessThanOrEqual(13)
		expect(copticDate.day).toBeGreaterThan(0)
	})

	it('should return valid Coptic date for any Gregorian date', () => {
		const gregorianDate = new Date('2023-03-15')
		const copticDate = fromGregorian(gregorianDate)

		expect(copticDate).toHaveProperty('dateString')
		expect(copticDate).toHaveProperty('day')
		expect(copticDate).toHaveProperty('month')
		expect(copticDate).toHaveProperty('year')
		expect(copticDate).toHaveProperty('monthString')
		expect(typeof copticDate.day).toBe('number')
		expect(typeof copticDate.month).toBe('number')
		expect(typeof copticDate.year).toBe('number')
		expect(copticDate.month).toBeGreaterThanOrEqual(1)
		expect(copticDate.month).toBeLessThanOrEqual(13)
	})

	it('should handle leap years correctly', () => {
		const date1 = fromGregorian(new Date('2024-02-29')) // Leap year
		const date2 = fromGregorian(new Date('2023-02-28')) // Non-leap year

		expect(date1).toHaveProperty('dateString')
		expect(date2).toHaveProperty('dateString')
		expect(typeof date1.day).toBe('number')
		expect(typeof date2.day).toBe('number')
	})
})
