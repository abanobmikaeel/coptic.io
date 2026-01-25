import { describe, expect, it } from 'vitest'
import { getSubscriptionCalendar, getYearCalendar } from '../../services/calendar.service'

describe('Calendar Service', () => {
	describe('getSubscriptionCalendar', () => {
		it('should generate a multi-year iCal subscription', () => {
			const result = getSubscriptionCalendar()

			expect(result).toBeTruthy()
			expect(result).toContain('BEGIN:VCALENDAR')
			expect(result).toContain('END:VCALENDAR')
			expect(result).toContain('VERSION:2.0')
			expect(result).toContain('PRODID:-//Coptic.IO//Coptic Orthodox Calendar//EN')
		})

		it('should include multiple years of events', () => {
			const result = getSubscriptionCalendar()

			// Should contain multiple years (current -1 to current +2)
			const currentYear = new Date().getFullYear()
			const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2]

			// Each year should have some events
			years.forEach((year) => {
				expect(result).toContain(year.toString())
			})
		})

		it('should have matching BEGIN/END VCALENDAR tags', () => {
			const result = getSubscriptionCalendar()

			const beginCount = (result.match(/BEGIN:VCALENDAR/g) || []).length
			const endCount = (result.match(/END:VCALENDAR/g) || []).length

			expect(beginCount).toBe(1)
			expect(endCount).toBe(1)
		})

		it('should have matching BEGIN/END VEVENT tags', () => {
			const result = getSubscriptionCalendar()

			const beginCount = (result.match(/BEGIN:VEVENT/g) || []).length
			const endCount = (result.match(/END:VEVENT/g) || []).length

			expect(beginCount).toBeGreaterThan(0)
			expect(beginCount).toBe(endCount)
		})
	})

	describe('getYearCalendar', () => {
		it('should generate iCal for a specific year', () => {
			const result = getYearCalendar(2025)

			expect(result).toBeTruthy()
			expect(result).toContain('BEGIN:VCALENDAR')
			expect(result).toContain('END:VCALENDAR')
			expect(result).toContain('VERSION:2.0')
			expect(result).toContain('2025')
		})

		it('should throw error for year below 1900', () => {
			expect(() => getYearCalendar(1899)).toThrow('Invalid year. Must be between 1900 and 2199')
		})

		it('should throw error for year above 2199', () => {
			expect(() => getYearCalendar(2200)).toThrow('Invalid year. Must be between 1900 and 2199')
		})

		it('should throw error for NaN year', () => {
			expect(() => getYearCalendar(Number.NaN)).toThrow(
				'Invalid year. Must be between 1900 and 2199',
			)
		})

		it('should accept year 1900', () => {
			const result = getYearCalendar(1900)

			expect(result).toBeTruthy()
			expect(result).toContain('BEGIN:VCALENDAR')
			expect(result).toContain('1900')
		})

		it('should accept year 2199', () => {
			const result = getYearCalendar(2199)

			expect(result).toBeTruthy()
			expect(result).toContain('BEGIN:VCALENDAR')
			expect(result).toContain('2199')
		})

		it('should have matching BEGIN/END VCALENDAR tags', () => {
			const result = getYearCalendar(2025)

			const beginCount = (result.match(/BEGIN:VCALENDAR/g) || []).length
			const endCount = (result.match(/END:VCALENDAR/g) || []).length

			expect(beginCount).toBe(1)
			expect(endCount).toBe(1)
		})

		it('should have matching BEGIN/END VEVENT tags', () => {
			const result = getYearCalendar(2025)

			const beginCount = (result.match(/BEGIN:VEVENT/g) || []).length
			const endCount = (result.match(/END:VEVENT/g) || []).length

			expect(beginCount).toBeGreaterThan(0)
			expect(beginCount).toBe(endCount)
		})

		it('should include feasts and celebrations', () => {
			const result = getYearCalendar(2025)

			// Should contain some standard feasts
			expect(result).toContain('SUMMARY:')
			expect(result).toContain('DTSTART')
		})

		it('should handle different years consistently', () => {
			const result2024 = getYearCalendar(2024)
			const result2025 = getYearCalendar(2025)

			expect(result2024).toBeTruthy()
			expect(result2025).toBeTruthy()
			expect(result2024).toContain('2024')
			expect(result2025).toContain('2025')
		})
	})
})
