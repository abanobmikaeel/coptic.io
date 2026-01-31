import {
	type CalendarDay,
	type CalendarMonth,
	type CopticMonthInfo,
	gregorianToCoptic,
} from '@coptic/core'
import { format, getDaysInMonth } from 'date-fns'
import { generateMultiYearCalendar, generateYearCalendar } from '../utils/icalGenerator'
import { getFastingForDate } from './fasting.service'

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

	const firstOfMonth = new Date(year, month - 1, 1)
	const numDays = getDaysInMonth(firstOfMonth)
	const days: CalendarDay[] = []
	const copticMonthsSeen = new Map<string, CopticMonthInfo>()

	for (let day = 1; day <= numDays; day++) {
		const date = new Date(year, month - 1, day)
		const copticDate = gregorianToCoptic(date)
		const fasting = getFastingForDate(date)

		days.push({ gregorianDate: format(date, 'yyyy-MM-dd'), copticDate, fasting })

		const key = `${copticDate.year}-${copticDate.month}`
		if (!copticMonthsSeen.has(key)) {
			copticMonthsSeen.set(key, {
				month: copticDate.month,
				monthString: copticDate.monthString,
				year: copticDate.year,
				startDay: day,
			})
		}
	}

	return {
		year,
		month,
		monthName: format(firstOfMonth, 'MMMM'),
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
