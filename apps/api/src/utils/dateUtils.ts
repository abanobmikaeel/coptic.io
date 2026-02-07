import { addDays as dateFnsAddDays, startOfDay } from 'date-fns'

/**
 * Shared date utility functions using date-fns
 */

/**
 * Add days to a date
 */
export const addDays = (date: Date, days: number): Date => {
	return dateFnsAddDays(date, days)
}

/**
 * Normalize date to local midnight to avoid timezone issues
 */
export const normalizeDate = (date: Date): Date => {
	return startOfDay(date)
}

/**
 * Parse a date string (YYYY-MM-DD) as a local date.
 * Using new Date("2025-01-15") interprets as UTC, which can shift the day
 * in timezones behind UTC. This function parses as local time instead.
 * Returns null if the date string is invalid.
 */
export const parseLocalDate = (dateString: string): Date | null => {
	const [year, month, day] = dateString.split('-').map(Number)
	if (!year || !month || !day) {
		return null
	}
	const date = new Date(year, month - 1, day) // month is 0-indexed
	if (Number.isNaN(date.getTime())) {
		return null
	}
	return date
}
