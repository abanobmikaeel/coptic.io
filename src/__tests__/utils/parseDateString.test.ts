import { describe, it, expect } from 'vitest'
import { parseDateString } from '../../utils/parseDateString'

describe('parseDateString', () => {
	it('should parse valid date string in YYYY-MM-DD format', () => {
		const result = parseDateString('2025-01-15')
		expect(result).not.toBeNull()
		expect(result?.getFullYear()).toBe(2025)
		expect(result?.getMonth()).toBe(0) // January is 0
		expect(result?.getDate()).toBe(15)
	})

	it('should parse date at beginning of year', () => {
		const result = parseDateString('2025-01-01')
		expect(result).not.toBeNull()
		expect(result?.getFullYear()).toBe(2025)
		expect(result?.getMonth()).toBe(0)
		expect(result?.getDate()).toBe(1)
	})

	it('should parse date at end of year', () => {
		const result = parseDateString('2024-12-31')
		expect(result).not.toBeNull()
		expect(result?.getFullYear()).toBe(2024)
		expect(result?.getMonth()).toBe(11) // December is 11
		expect(result?.getDate()).toBe(31)
	})

	it('should parse leap year date', () => {
		const result = parseDateString('2024-02-29')
		expect(result).not.toBeNull()
		expect(result?.getFullYear()).toBe(2024)
		expect(result?.getMonth()).toBe(1)
		expect(result?.getDate()).toBe(29)
	})

	it('should return null for invalid date format (no hyphens)', () => {
		const result = parseDateString('20250115')
		expect(result).toBeNull()
	})

	it('should return null for incomplete date string', () => {
		const result = parseDateString('2025-01')
		expect(result).toBeNull()
	})

	it('should return null for empty string', () => {
		const result = parseDateString('')
		expect(result).toBeNull()
	})

	it('should return null for invalid month', () => {
		const result = parseDateString('2025-13-15')
		expect(result).toBeNull()
	})

	it('should return null for invalid day', () => {
		const result = parseDateString('2025-02-30')
		expect(result).toBeNull()
	})

	it('should return null for non-numeric values', () => {
		const result = parseDateString('2025-ab-cd')
		expect(result).toBeNull()
	})

	it('should return null for partially invalid date', () => {
		const result = parseDateString('2025-01-abc')
		expect(result).toBeNull()
	})

	it('should handle single digit month and day with leading zeros', () => {
		const result = parseDateString('2025-03-05')
		expect(result).not.toBeNull()
		expect(result?.getMonth()).toBe(2) // March is 2
		expect(result?.getDate()).toBe(5)
	})

	it('should create date in local timezone (not UTC)', () => {
		const result = parseDateString('2025-01-15')
		expect(result).not.toBeNull()
		// Verify the date doesn't shift due to timezone
		expect(result?.getDate()).toBe(15)
		expect(result?.getMonth()).toBe(0)
		expect(result?.getFullYear()).toBe(2025)
	})

	it('should handle dates across different months correctly', () => {
		const jan = parseDateString('2025-01-31')
		const feb = parseDateString('2025-02-01')

		expect(jan).not.toBeNull()
		expect(feb).not.toBeNull()
		expect(jan?.getMonth()).toBe(0)
		expect(feb?.getMonth()).toBe(1)
	})
})
