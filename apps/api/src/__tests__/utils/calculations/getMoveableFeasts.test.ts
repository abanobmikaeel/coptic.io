import { describe, expect, it } from 'vitest'
import { getMoveableFeastsForDate, getMoveableFeastsForYear } from '@coptic/core'

describe('Moveable Feasts', () => {
	it('should calculate Easter 2025 correctly', () => {
		const testDate = new Date(2025, 3, 20) // April 20, 2025
		const feasts = getMoveableFeastsForDate(testDate)

		expect(feasts.length).toBeGreaterThan(0)
		expect(feasts.some((f) => f.name === 'Easter')).toBe(true)
	})

	it('should calculate Palm Sunday 2025 correctly', () => {
		const testDate = new Date(2025, 3, 13) // April 13, 2025
		const feasts = getMoveableFeastsForDate(testDate)

		expect(feasts.length).toBeGreaterThan(0)
		expect(feasts.some((f) => f.name === 'Palm Sunday')).toBe(true)
	})

	it('should calculate Ascension 2025 correctly', () => {
		const testDate = new Date(2025, 4, 29) // May 29, 2025
		const feasts = getMoveableFeastsForDate(testDate)

		expect(feasts.length).toBeGreaterThan(0)
		expect(feasts.some((f) => f.name === 'Ascension')).toBe(true)
	})

	it('should calculate Pentecost 2025 correctly', () => {
		const testDate = new Date(2025, 5, 8) // June 8, 2025
		const feasts = getMoveableFeastsForDate(testDate)

		expect(feasts.length).toBeGreaterThan(0)
		expect(feasts.some((f) => f.name === 'Pentecost')).toBe(true)
	})

	it('should return all moveable feasts for 2025', () => {
		const feasts = getMoveableFeastsForYear(2025)

		expect(feasts.length).toBe(10) // All 10 moveable feasts
		expect(feasts.find((f) => f.name === 'Easter')).toBeDefined()
		expect(feasts.find((f) => f.name === 'Palm Sunday')).toBeDefined()
		expect(feasts.find((f) => f.name === 'Good Friday')).toBeDefined()
		expect(feasts.find((f) => f.name === 'Ascension')).toBeDefined()
		expect(feasts.find((f) => f.name === 'Pentecost')).toBeDefined()
	})
})
