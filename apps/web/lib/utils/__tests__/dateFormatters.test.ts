import { describe, expect, it } from 'vitest'
import { formatCalendarDayLabel, getCalendarGridCellCount } from '../dateFormatters'

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

describe('formatCalendarDayLabel', () => {
	const day = { gregorianDate: '2026-09-27', copticDate: { dateString: 'Tout 17, 1743' } }

	it("names the full date in the reader's language", () => {
		expect(formatCalendarDayLabel(day, 'en', false)).toBe('Sunday, September 27, 2026')
	})

	it('reads the date as a local calendar day, not UTC midnight', () => {
		// new Date('2026-09-01') is UTC and would name August 31 west of Greenwich
		const first = { ...day, gregorianDate: '2026-09-01' }
		expect(formatCalendarDayLabel(first, 'en', false)).toBe('Tuesday, September 1, 2026')
	})

	it('adds the Coptic date when the grid is numbered by it, and the fast', () => {
		expect(formatCalendarDayLabel({ ...day, fastName: 'Nativity Fast' }, 'en', true)).toBe(
			'Sunday, September 27, 2026, Tout 17, 1743, Nativity Fast',
		)
	})

	it('uses Arabic-Indic digits and the Arabic comma for Arabic', () => {
		const label = formatCalendarDayLabel({ ...day, fastName: 'Nativity Fast' }, 'ar', false)
		expect(label).toMatch(/٢٧/)
		expect(label).toMatch(/، Nativity Fast$/)
	})
})
