import { describe, expect, it } from 'vitest'
import {
	formatCalendarDayLabel,
	formatNumber,
	getMonthNames,
	getWeekdayNames,
} from '../dateFormatters'

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

describe('getWeekdayNames', () => {
	it('starts on Sunday, as the grid does', () => {
		expect(getWeekdayNames('en')).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
	})

	it("names the days in the reader's language", () => {
		expect(getWeekdayNames('ar')[0]).toBe('الأحد')
		expect(getWeekdayNames('es')[0]).toMatch(/^dom/)
	})

	it('offers one-letter names for narrow columns', () => {
		expect(getWeekdayNames('en', 'narrow')).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S'])
		expect(getWeekdayNames('ar', 'narrow')[0]).toHaveLength(1)
	})
})

describe('getMonthNames', () => {
	it("lists the twelve months in the reader's language", () => {
		expect(getMonthNames('en')).toHaveLength(12)
		expect(getMonthNames('en')[8]).toBe('September')
		expect(getMonthNames('ar')[8]).toBe('سبتمبر')
		expect(getMonthNames('es')[8]).toBe('septiembre')
	})
})

describe('formatNumber', () => {
	it('writes years without grouping, in Arabic-Indic digits for Arabic', () => {
		expect(formatNumber(2026, 'en')).toBe('2026')
		expect(formatNumber(2026, 'ar')).toBe('٢٠٢٦')
	})
})
