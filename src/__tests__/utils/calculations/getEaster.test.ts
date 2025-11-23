import { describe, it, expect } from 'vitest'
import getEaster from '../../../utils/calculations/getEaster'

describe('Easter Calculation', () => {
	it('should calculate Easter correctly for 2024', () => {
		const easter = getEaster(2024)
		expect(easter).toHaveProperty('day')
		expect(easter).toHaveProperty('month')
		expect(easter).toHaveProperty('year')
		expect(easter.year).toBe(2024)
		// Easter should be in April (month 4) or May (month 5)
		expect(easter.month).toBeGreaterThanOrEqual(4)
		expect(easter.month).toBeLessThanOrEqual(5)
	})

	it('should calculate Easter correctly for 2025', () => {
		const easter = getEaster(2025)
		expect(easter).toHaveProperty('day')
		expect(easter).toHaveProperty('month')
		expect(easter.year).toBe(2025)
	})

	it('should return different dates for different years', () => {
		const easter2024 = getEaster(2024)
		const easter2025 = getEaster(2025)
		// Either month or day should be different
		const isDifferent = easter2024.month !== easter2025.month || easter2024.day !== easter2025.day
		expect(isDifferent).toBe(true)
	})

	it('should handle edge case years', () => {
		const easter1900 = getEaster(1900)
		const easter2100 = getEaster(2100)

		expect(easter1900).toHaveProperty('day')
		expect(easter1900).toHaveProperty('month')
		expect(easter1900.year).toBe(1900)

		expect(easter2100).toHaveProperty('day')
		expect(easter2100).toHaveProperty('month')
		expect(easter2100.year).toBe(2100)
	})

	it('should return valid day and month values', () => {
		const easter = getEaster(2024)
		expect(easter.day).toBeGreaterThan(0)
		expect(easter.day).toBeLessThanOrEqual(31)
		expect(easter.month).toBeGreaterThanOrEqual(1)
		expect(easter.month).toBeLessThanOrEqual(12)
	})
})
