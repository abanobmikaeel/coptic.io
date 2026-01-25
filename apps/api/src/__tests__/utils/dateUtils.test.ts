import { describe, expect, it } from 'vitest'
import { addDays, normalizeDate } from '../../utils/dateUtils'

describe('Date Utils', () => {
	describe('addDays', () => {
		it('should add positive days to a date', () => {
			const date = new Date(2025, 0, 15)
			const result = addDays(date, 5)

			expect(result.getDate()).toBe(20)
			expect(result.getMonth()).toBe(0)
			expect(result.getFullYear()).toBe(2025)
		})

		it('should subtract days when given negative number', () => {
			const date = new Date(2025, 0, 15)
			const result = addDays(date, -5)

			expect(result.getDate()).toBe(10)
			expect(result.getMonth()).toBe(0)
			expect(result.getFullYear()).toBe(2025)
		})

		it('should handle month transitions', () => {
			const date = new Date(2025, 0, 30)
			const result = addDays(date, 5)

			expect(result.getDate()).toBe(4)
			expect(result.getMonth()).toBe(1)
			expect(result.getFullYear()).toBe(2025)
		})

		it('should handle year transitions', () => {
			const date = new Date(2024, 11, 30)
			const result = addDays(date, 5)

			expect(result.getDate()).toBe(4)
			expect(result.getMonth()).toBe(0)
			expect(result.getFullYear()).toBe(2025)
		})

		it('should handle leap years correctly', () => {
			const date = new Date(2024, 1, 28)
			const result = addDays(date, 2)

			expect(result.getDate()).toBe(1)
			expect(result.getMonth()).toBe(2)
		})

		it('should not mutate original date', () => {
			const date = new Date(2025, 0, 15)
			const originalTime = date.getTime()
			addDays(date, 5)

			expect(date.getTime()).toBe(originalTime)
		})

		it('should handle adding zero days', () => {
			const date = new Date(2025, 0, 15)
			const result = addDays(date, 0)

			expect(result.getDate()).toBe(15)
			expect(result.getMonth()).toBe(0)
			expect(result.getFullYear()).toBe(2025)
		})
	})

	describe('normalizeDate', () => {
		it('should normalize date to midnight local time', () => {
			const date = new Date(2025, 0, 15, 14, 30, 45, 123)
			const result = normalizeDate(date)

			expect(result.getHours()).toBe(0)
			expect(result.getMinutes()).toBe(0)
			expect(result.getSeconds()).toBe(0)
			expect(result.getMilliseconds()).toBe(0)
		})

		it('should preserve year, month, and day', () => {
			const date = new Date(2025, 5, 20, 14, 30)
			const result = normalizeDate(date)

			expect(result.getFullYear()).toBe(2025)
			expect(result.getMonth()).toBe(5)
			expect(result.getDate()).toBe(20)
		})

		it('should handle dates at different times of day', () => {
			const morning = new Date(2025, 0, 15, 8, 0)
			const evening = new Date(2025, 0, 15, 20, 0)

			const resultMorning = normalizeDate(morning)
			const resultEvening = normalizeDate(evening)

			expect(resultMorning.getTime()).toBe(resultEvening.getTime())
		})

		it('should handle already normalized dates', () => {
			const date = new Date(2025, 0, 15, 0, 0, 0, 0)
			const result = normalizeDate(date)

			expect(result.getTime()).toBe(date.getTime())
		})

		it('should not mutate original date', () => {
			const date = new Date(2025, 0, 15, 14, 30)
			const originalTime = date.getTime()
			normalizeDate(date)

			expect(date.getTime()).toBe(originalTime)
		})
	})
})
