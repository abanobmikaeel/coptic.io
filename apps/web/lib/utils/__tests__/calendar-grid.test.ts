import { describe, expect, it } from 'vitest'
import { getMonthGridLayout } from '../calendar-grid'

describe('getMonthGridLayout', () => {
	it('returns a 4-week layout for February 2026 (starts on Sunday)', () => {
		expect(getMonthGridLayout(2026, 2)).toEqual({ leadingBlanks: 0, totalCells: 28 })
	})

	it('returns a 5-week layout for March 2026 (starts on Sunday)', () => {
		expect(getMonthGridLayout(2026, 3)).toEqual({ leadingBlanks: 0, totalCells: 35 })
	})

	it('returns a 6-week layout for August 2026 (starts on Saturday)', () => {
		expect(getMonthGridLayout(2026, 8)).toEqual({ leadingBlanks: 6, totalCells: 42 })
	})

	it('returns a 5-week layout for a leap-year February (2024 starts on Thursday)', () => {
		expect(getMonthGridLayout(2024, 2)).toEqual({ leadingBlanks: 4, totalCells: 35 })
	})
})
