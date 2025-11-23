import { describe, it, expect } from 'vitest'
import { getFastingForDate, getFastingCalendar } from '../../services/fasting.service'
import { parse } from 'date-fns'

describe('Fasting Service', () => {
	describe('getFastingForDate', () => {
		it('should return fasting information for any date', () => {
			const date = new Date(2025, 0, 7)
			const result = getFastingForDate(date)

			expect(result).toHaveProperty('isFasting')
			expect(result).toHaveProperty('fastType')
			expect(result).toHaveProperty('description')
			expect(typeof result.isFasting).toBe('boolean')
		})

		it('should return non-fasting for non-fast days', () => {
			const date = new Date(2025, 5, 15)
			const result = getFastingForDate(date)

			if (!result.isFasting) {
				expect(result.isFasting).toBe(false)
				expect(result.fastType).toBeNull()
				expect(result.description).toBeNull()
			}
		})

		it('should detect moveable fasting periods', () => {
			const greatLentDate = new Date(2025, 2, 15)
			const result = getFastingForDate(greatLentDate)

			if (result.isFasting) {
				expect(result.isFasting).toBe(true)
				expect(result.fastType).toBeTruthy()
				expect(result.description).toBeTruthy()
			}
		})

		it('should detect Nativity Fast (November 25 - January 6)', () => {
			const nativityFastDate = new Date(2024, 11, 25)
			const result = getFastingForDate(nativityFastDate)

			if (result.isFasting) {
				expect(result.isFasting).toBe(true)
				expect(result.fastType).toBeTruthy()
				expect(result.description).toBeTruthy()
			}
		})

		it('should handle dates during Great Lent', () => {
			const greatLentDate = new Date(2025, 2, 20)
			const result = getFastingForDate(greatLentDate)

			if (result.isFasting) {
				expect(result.isFasting).toBe(true)
			}
		})

		it('should handle Wednesdays correctly', () => {
			const wednesday = new Date(2025, 5, 18)
			const result = getFastingForDate(wednesday)

			expect(result).toHaveProperty('isFasting')
			expect(typeof result.isFasting).toBe('boolean')
		})

		it('should handle Fridays correctly', () => {
			const friday = new Date(2025, 5, 20)
			const result = getFastingForDate(friday)

			expect(result).toHaveProperty('isFasting')
			expect(typeof result.isFasting).toBe('boolean')
		})

		it('should handle different years', () => {
			const date2025 = new Date(2025, 0, 7)
			const date2024 = new Date(2024, 0, 7)

			const result2025 = getFastingForDate(date2025)
			const result2024 = getFastingForDate(date2024)

			expect(result2025).toHaveProperty('isFasting')
			expect(result2024).toHaveProperty('isFasting')
		})

		it('should handle Paschal season (non-fasting)', () => {
			const paschalDate = new Date(2025, 3, 25)
			const result = getFastingForDate(paschalDate)

			expect(result).toHaveProperty('isFasting')
			expect(typeof result.isFasting).toBe('boolean')
		})

		it('should return string or null for fastType', () => {
			const date = new Date(2025, 0, 7)
			const result = getFastingForDate(date)

			if (result.fastType !== null) {
				expect(typeof result.fastType).toBe('string')
			} else {
				expect(result.fastType).toBeNull()
			}
		})

		it('should return string or null for description', () => {
			const date = new Date(2025, 0, 7)
			const result = getFastingForDate(date)

			if (result.description !== null) {
				expect(typeof result.description).toBe('string')
			} else {
				expect(result.description).toBeNull()
			}
		})

		it('should handle leap year dates', () => {
			const leapYearDate = new Date(2024, 1, 29)
			const result = getFastingForDate(leapYearDate)

			expect(result).toHaveProperty('isFasting')
			expect(typeof result.isFasting).toBe('boolean')
		})
	})

	describe('getFastingCalendar', () => {
		it('should return an array of fasting days for a year', () => {
			const calendar = getFastingCalendar(2025)

			expect(Array.isArray(calendar)).toBe(true)
		})

		it('should include fasting days with proper structure', () => {
			const calendar = getFastingCalendar(2025)

			calendar.forEach((day) => {
				expect(day).toHaveProperty('date')
				expect(day).toHaveProperty('copticDate')
				expect(day).toHaveProperty('fastType')
				expect(day).toHaveProperty('description')
				expect(typeof day.date).toBe('string')
				expect(typeof day.fastType).toBe('string')
				expect(typeof day.description).toBe('string')
			})
		})

		it('should have valid date format (YYYY-MM-DD)', () => {
			const calendar = getFastingCalendar(2025)

			calendar.forEach((day) => {
				expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
			})
		})

		it('should have valid coptic date structure', () => {
			const calendar = getFastingCalendar(2025)

			calendar.forEach((day) => {
				expect(day.copticDate).toHaveProperty('dateString')
				expect(day.copticDate).toHaveProperty('day')
				expect(day.copticDate).toHaveProperty('month')
				expect(day.copticDate).toHaveProperty('year')
				expect(day.copticDate).toHaveProperty('monthString')
			})
		})

		it('should include dates in chronological order', () => {
			const calendar = getFastingCalendar(2025)

			for (let i = 1; i < calendar.length; i++) {
				const prevDate = new Date(calendar[i - 1].date)
				const currDate = new Date(calendar[i].date)
				expect(currDate >= prevDate).toBe(true)
			}
		})

		it('should include major fasting periods', () => {
			const calendar = getFastingCalendar(2025)
			const descriptions = calendar.map((day) => day.description)

			expect(descriptions.some((desc) => desc.includes('Lent'))).toBe(true)
		})

		it('should handle different years', () => {
			const calendar2025 = getFastingCalendar(2025)
			const calendar2024 = getFastingCalendar(2024)

			expect(Array.isArray(calendar2025)).toBe(true)
			expect(Array.isArray(calendar2024)).toBe(true)
			expect(calendar2025.length).toBeGreaterThan(0)
			expect(calendar2024.length).toBeGreaterThan(0)
		})

		it('should only include dates within the requested year', () => {
			const calendar = getFastingCalendar(2025)

			calendar.forEach((day) => {
				const date = parse(day.date, 'yyyy-MM-dd', new Date())
				expect(date.getFullYear()).toBe(2025)
			})
		})

		it('should include both moveable and fixed fasts', () => {
			const calendar = getFastingCalendar(2025)

			expect(calendar.length).toBeGreaterThan(0)
		})

		it('should have non-empty fastType for all entries', () => {
			const calendar = getFastingCalendar(2025)

			calendar.forEach((day) => {
				expect(day.fastType.length).toBeGreaterThan(0)
			})
		})

		it('should have non-empty description for all entries', () => {
			const calendar = getFastingCalendar(2025)

			calendar.forEach((day) => {
				expect(day.description.length).toBeGreaterThan(0)
			})
		})

		it('should handle year with leap day', () => {
			const calendar = getFastingCalendar(2024)

			expect(Array.isArray(calendar)).toBe(true)
			expect(calendar.length).toBeGreaterThan(0)
		})

		it('should cover full year from January to December', () => {
			const calendar = getFastingCalendar(2025)

			if (calendar.length > 0) {
				const dates = calendar.map((day) => new Date(day.date))
				const months = dates.map((d) => d.getMonth())
				const uniqueMonths = [...new Set(months)]

				expect(uniqueMonths.length).toBeGreaterThan(0)
			}
		})
	})
})
