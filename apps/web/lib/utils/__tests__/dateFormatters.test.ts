import { describe, expect, it } from 'vitest'
import { getCalendarGridCellCount } from '../dateFormatters'

describe('getCalendarGridCellCount', () => {
	it('returns 28 for a 4-week February (2026 starts on Sunday)', () => {
		expect(getCalendarGridCellCount(2026, 2)).toBe(28)
	})

	it('returns 35 for a 5-week month (March 2026 starts on Sunday)', () => {
		expect(getCalendarGridCellCount(2026, 3)).toBe(35)
	})

	it('returns 42 for a 6-week month (August 2026 starts on Saturday)', () => {
		expect(getCalendarGridCellCount(2026, 8)).toBe(42)
	})

	it('returns 35 for a leap-year February (2024 starts on Thursday)', () => {
		expect(getCalendarGridCellCount(2024, 2)).toBe(35)
	})
})
