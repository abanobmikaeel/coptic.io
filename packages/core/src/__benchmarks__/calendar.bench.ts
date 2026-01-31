import { addDays, differenceInDays, format, startOfDay } from 'date-fns'
import { bench, describe } from 'vitest'
import {
	calculateEaster,
	formatCopticDate,
	getCopticDateKey,
	getEasterDate,
	getMoveableFeastsForDate,
	getMoveableFeastsForYear,
	gregorianToCoptic,
	isInMoveableFast,
} from '../index'

// Test dates spanning different scenarios
const testDates = {
	normal: new Date(2025, 5, 15), // June 15, 2025
	lent: new Date(2025, 2, 15), // March 15, 2025 (during Great Lent)
	easter: new Date(2025, 3, 20), // April 20, 2025 (Easter)
	leapYear: new Date(2024, 1, 29), // Feb 29, 2024
	yearStart: new Date(2025, 0, 1), // Jan 1
	yearEnd: new Date(2025, 11, 31), // Dec 31
}

// Pre-compute for comparison benchmarks
const precomputedCoptic = gregorianToCoptic(testDates.normal)

describe('Date Conversion', () => {
	bench('gregorianToCoptic - single date', () => {
		gregorianToCoptic(testDates.normal)
	})

	bench('gregorianToCoptic - during Lent', () => {
		gregorianToCoptic(testDates.lent)
	})

	bench('gregorianToCoptic - leap year', () => {
		gregorianToCoptic(testDates.leapYear)
	})

	bench('getCopticDateKey', () => {
		getCopticDateKey(testDates.normal)
	})

	bench('formatCopticDate', () => {
		formatCopticDate(precomputedCoptic)
	})

	// Batch conversion (simulates calendar month generation)
	bench('gregorianToCoptic - 31 days (month)', () => {
		const start = new Date(2025, 0, 1)
		for (let i = 0; i < 31; i++) {
			gregorianToCoptic(addDays(start, i))
		}
	})

	// Full year conversion
	bench('gregorianToCoptic - 365 days (year)', () => {
		const start = new Date(2025, 0, 1)
		for (let i = 0; i < 365; i++) {
			gregorianToCoptic(addDays(start, i))
		}
	})
})

describe('Easter/Pascha Calculation', () => {
	bench('calculateEaster - single year', () => {
		calculateEaster(2025)
	})

	bench('getEasterDate - single year', () => {
		getEasterDate(2025)
	})

	bench('calculateEaster - 10 years', () => {
		for (let year = 2020; year < 2030; year++) {
			calculateEaster(year)
		}
	})

	bench('calculateEaster - 100 years', () => {
		for (let year = 2000; year < 2100; year++) {
			calculateEaster(year)
		}
	})
})

describe('Moveable Feasts', () => {
	bench('getMoveableFeastsForYear', () => {
		getMoveableFeastsForYear(2025)
	})

	bench('getMoveableFeastsForDate - normal day', () => {
		getMoveableFeastsForDate(testDates.normal)
	})

	bench('getMoveableFeastsForDate - Easter', () => {
		getMoveableFeastsForDate(testDates.easter)
	})

	bench('isInMoveableFast - not fasting', () => {
		isInMoveableFast(testDates.normal)
	})

	bench('isInMoveableFast - during Lent', () => {
		isInMoveableFast(testDates.lent)
	})

	bench('isInMoveableFast - during Nineveh', () => {
		isInMoveableFast(new Date(2025, 1, 11)) // Feb 11, 2025
	})

	bench('isInMoveableFast - during Apostles Fast', () => {
		isInMoveableFast(new Date(2025, 5, 15)) // June 15, 2025
	})

	// Full year fasting check (simulates fasting calendar generation)
	bench('isInMoveableFast - 365 days', () => {
		const start = new Date(2025, 0, 1)
		for (let i = 0; i < 365; i++) {
			isInMoveableFast(addDays(start, i))
		}
	})
})

describe('Comparison: date-fns operations', () => {
	// Baseline comparisons to understand relative performance

	bench('date-fns: addDays', () => {
		addDays(testDates.normal, 30)
	})

	bench('date-fns: format (yyyy-MM-dd)', () => {
		format(testDates.normal, 'yyyy-MM-dd')
	})

	bench('date-fns: startOfDay', () => {
		startOfDay(testDates.normal)
	})

	bench('date-fns: differenceInDays', () => {
		differenceInDays(testDates.yearEnd, testDates.yearStart)
	})

	bench('new Date() construction', () => {
		new Date(2025, 5, 15)
	})

	bench('Date.getFullYear/Month/Date', () => {
		const d = testDates.normal
		d.getFullYear()
		d.getMonth()
		d.getDate()
	})
})

describe('Combined Operations (Real-world scenarios)', () => {
	// Calendar month view: convert + format for 31 days
	bench('Calendar month: convert + format 31 days', () => {
		const start = new Date(2025, 2, 1) // March
		for (let i = 0; i < 31; i++) {
			const date = addDays(start, i)
			const coptic = gregorianToCoptic(date)
			formatCopticDate(coptic)
		}
	})

	// Fasting calendar: check fasting for entire year
	bench('Fasting calendar: full year generation', () => {
		const start = new Date(2025, 0, 1)
		for (let i = 0; i < 365; i++) {
			const date = addDays(start, i)
			gregorianToCoptic(date)
			isInMoveableFast(date)
		}
	})

	// iCal generation: moveable feasts for 4 years
	bench('iCal: moveable feasts for 4 years', () => {
		for (let year = 2024; year <= 2027; year++) {
			getMoveableFeastsForYear(year)
		}
	})
})
