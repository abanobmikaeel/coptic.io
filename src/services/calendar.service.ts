import { generateYearCalendar, generateMultiYearCalendar } from '../utils/icalGenerator'

export const getSubscriptionCalendar = () => {
	const currentYear = new Date().getFullYear()
	const startYear = currentYear - 1
	const endYear = currentYear + 2 // Include previous year, current, and next 2 years

	return generateMultiYearCalendar(startYear, endYear)
}

export const getYearCalendar = (year: number) => {
	if (isNaN(year) || year < 1900 || year > 2199) {
		throw new Error('Invalid year. Must be between 1900 and 2199')
	}

	return generateYearCalendar(year)
}
