import { describe, expect, it } from 'vitest'
import {
	formatCalendarDate,
	monthView,
	parseCalendarDate,
	shiftMonth,
	yearsAround,
} from '../calendar-view'

// Local noon on Sunday 27 September 2026
const today = new Date(2026, 8, 27, 12)

describe('parseCalendarDate', () => {
	it('shows today when there is no date', () => {
		expect(parseCalendarDate(null, today)).toEqual({ year: 2026, month: 9, day: 27 })
	})

	it('reads a selected day and a month with no selection', () => {
		expect(parseCalendarDate('2027-03-05', today)).toEqual({ year: 2027, month: 3, day: 5 })
		expect(parseCalendarDate('2027-03', today)).toEqual({ year: 2027, month: 3, day: null })
	})

	it('reads any year, with no supported window', () => {
		expect(parseCalendarDate('1901-01', today)).toEqual({ year: 1901, month: 1, day: null })
		expect(parseCalendarDate('2199-12-31', today)).toEqual({ year: 2199, month: 12, day: 31 })
	})

	it('falls back to today for malformed or impossible dates', () => {
		for (const bad of ['garbage', '2026-13', '2026-00-10', '2026-02-30', '2026-9-1', '']) {
			expect(parseCalendarDate(bad, today)).toEqual({ year: 2026, month: 9, day: 27 })
		}
	})

	it('accepts 29 February only in a leap year', () => {
		expect(parseCalendarDate('2028-02-29', today).day).toBe(29)
		expect(parseCalendarDate('2027-02-29', today).day).toBe(27)
	})
})

describe('formatCalendarDate', () => {
	it('round-trips with parseCalendarDate', () => {
		for (const value of ['2026-09-27', '2027-03', '1999-12-31']) {
			expect(formatCalendarDate(parseCalendarDate(value, today))).toBe(value)
		}
	})
})

describe('monthView', () => {
	it("keeps today selected when landing on today's month", () => {
		expect(monthView(2026, 9, today)).toEqual({ year: 2026, month: 9, day: 27 })
	})

	it('opens any other month on its first day', () => {
		expect(monthView(2026, 10, today)).toEqual({ year: 2026, month: 10, day: 1 })
		expect(monthView(2025, 9, today)).toEqual({ year: 2025, month: 9, day: 1 })
	})
})

describe('shiftMonth', () => {
	it('steps across year boundaries in both directions', () => {
		expect(shiftMonth({ year: 2026, month: 12, day: 1 }, 1, today)).toMatchObject({
			year: 2027,
			month: 1,
		})
		expect(shiftMonth({ year: 2027, month: 1, day: 1 }, -1, today)).toMatchObject({
			year: 2026,
			month: 12,
		})
	})

	it("reselects today when stepping back into today's month", () => {
		expect(shiftMonth({ year: 2026, month: 10, day: 1 }, -1, today)).toEqual({
			year: 2026,
			month: 9,
			day: 27,
		})
	})
})

describe('yearsAround', () => {
	it('centres the window on the year shown, so it moves as you navigate', () => {
		expect(yearsAround(2026, 2)).toEqual([2024, 2025, 2026, 2027, 2028])
		expect(yearsAround(1950, 1)).toEqual([1949, 1950, 1951])
	})
})
