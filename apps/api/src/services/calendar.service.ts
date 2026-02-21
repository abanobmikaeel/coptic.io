import type { CalendarDay, CalendarMonth, CopticMonthInfo } from '@coptic/core'
import { format } from 'date-fns'
import { generateMultiYearCalendar, generateYearCalendar } from '../utils/icalGenerator'
import { type DayEntry, getMonthView } from './yearView.service'

const NO_FASTING = { isFasting: false, fastType: null, description: null } as const

const fastingFromDayEntry = (d: DayEntry) => {
	if (d.moveableFast) {
		return { isFasting: true, fastType: d.moveableFast.type, description: d.moveableFast.name }
	}
	const fast = d.celebrations?.find((c) => c.type.toLowerCase().includes('fast'))
	if (fast) {
		return { isFasting: true, fastType: fast.type, description: fast.name }
	}
	return NO_FASTING
}

// In-memory cache for generated iCal calendars (24-hour TTL)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const calendarCache = new Map<string, { data: string; expires: number }>()

export const getCalendarMonth = (year: number, month: number): CalendarMonth => {
	if (Number.isNaN(year) || year < 1900 || year > 2199) {
		throw new Error('Invalid year. Must be between 1900 and 2199')
	}
	if (Number.isNaN(month) || month < 1 || month > 12) {
		throw new Error('Invalid month. Must be between 1 and 12')
	}

	const monthDays = getMonthView(year, month)
	const copticMonthsSeen = new Map<string, CopticMonthInfo>()

	const days: CalendarDay[] = monthDays.map((d, i) => {
		const fasting = fastingFromDayEntry(d)

		const key = `${d.copticDate.year}-${d.copticDate.month}`
		if (!copticMonthsSeen.has(key)) {
			copticMonthsSeen.set(key, {
				month: d.copticDate.month,
				monthString: d.copticDate.monthString,
				year: d.copticDate.year,
				startDay: i + 1,
			})
		}

		return { gregorianDate: d.gregorianDate, copticDate: d.copticDate, fasting }
	})

	return {
		year,
		month,
		monthName: format(new Date(year, month - 1, 1), 'MMMM'),
		days,
		copticMonths: Array.from(copticMonthsSeen.values()),
	}
}

export const getSubscriptionCalendar = () => {
	const currentYear = new Date().getFullYear()
	const cacheKey = `subscription-${currentYear}`

	// Check cache
	const cached = calendarCache.get(cacheKey)
	if (cached && cached.expires > Date.now()) {
		return cached.data
	}

	// Generate and cache
	const startYear = currentYear - 1
	const endYear = currentYear + 2
	const data = generateMultiYearCalendar(startYear, endYear)

	calendarCache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL_MS })
	return data
}

export const getYearCalendar = (year: number) => {
	if (Number.isNaN(year) || year < 1900 || year > 2199) {
		throw new Error('Invalid year. Must be between 1900 and 2199')
	}

	const cacheKey = `year-${year}`

	// Check cache
	const cached = calendarCache.get(cacheKey)
	if (cached && cached.expires > Date.now()) {
		return cached.data
	}

	// Generate and cache
	const data = generateYearCalendar(year)
	calendarCache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL_MS })
	return data
}
