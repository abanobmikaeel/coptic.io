import { generateYearCalendar, generateMultiYearCalendar } from '../utils/icalGenerator'
import fromGregorian from '../utils/copticDate'
import { getFastingForDate } from './fasting.service'
import { format, getDaysInMonth } from 'date-fns'
import type { CalendarMonth, CalendarDay, CopticMonthInfo } from '../types'

export const getCalendarMonth = (year: number, month: number): CalendarMonth => {
	if (isNaN(year) || year < 1900 || year > 2199) {
		throw new Error('Invalid year. Must be between 1900 and 2199')
	}
	if (isNaN(month) || month < 1 || month > 12) {
		throw new Error('Invalid month. Must be between 1 and 12')
	}

	const firstOfMonth = new Date(year, month - 1, 1)
	const numDays = getDaysInMonth(firstOfMonth)
	const days: CalendarDay[] = []
	const copticMonthsSeen = new Map<string, CopticMonthInfo>()

	for (let day = 1; day <= numDays; day++) {
		const date = new Date(year, month - 1, day)
		const copticDate = fromGregorian(date)
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
	const startYear = currentYear - 1
	const endYear = currentYear + 2

	return generateMultiYearCalendar(startYear, endYear)
}

export const getYearCalendar = (year: number) => {
	if (isNaN(year) || year < 1900 || year > 2199) {
		throw new Error('Invalid year. Must be between 1900 and 2199')
	}

	return generateYearCalendar(year)
}
