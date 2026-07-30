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

const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/**
 * Bounds on the year a request may ask for. These are input sanity, not a limit
 * of the calendar maths — @coptic/core computes Pascha, the seasons and the
 * fasting rules for any year. The floor is the first full year of the Gregorian
 * calendar, before which a Gregorian date is a back-projection rather than a date
 * anyone observed; the ceiling is what fits YYYY-MM-DD.
 */
const MIN_YEAR = 1583
const MAX_YEAR = 9999

/** Wording shared by every route that rejects a date, so clients see one contract. */
export const INVALID_DATE_MESSAGE = `Invalid date. Use YYYY-MM-DD between ${MIN_YEAR} and ${MAX_YEAR}`

/** Wording shared by every route that takes a year rather than a full date. */
export const INVALID_YEAR_MESSAGE = `Invalid year. Must be between ${MIN_YEAR} and ${MAX_YEAR}`

/** True when the year is one the API will answer for. */
export const isSupportedYear = (year: number): boolean =>
	Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR

/**
 * Parse a date string (YYYY-MM-DD) as a local date.
 * Using new Date("2025-01-15") interprets as UTC, which can shift the day
 * in timezones behind UTC. This function parses as local time instead.
 * Returns null if the date string is invalid or does not exist (e.g. 2025-02-30).
 */
export const parseLocalDate = (dateString: string): Date | null => {
	const parts = dateString.split('-')
	if (parts.length !== 3) return null

	const year = Number.parseInt(parts[0] ?? '', 10)
	const month = Number.parseInt(parts[1] ?? '', 10)
	const day = Number.parseInt(parts[2] ?? '', 10)
	if ([year, month, day].some((n) => Number.isNaN(n))) return null
	if (year < MIN_YEAR || year > MAX_YEAR) return null
	if (month < 1 || month > 12 || day < 1) return null

	const maxDay = month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1]!
	if (day > maxDay) return null

	const date = new Date(year, month - 1, day)
	if (
		Number.isNaN(date.getTime()) ||
		date.getFullYear() !== year ||
		date.getMonth() !== month - 1 ||
		date.getDate() !== day
	) {
		return null
	}
	return date
}

/**
 * Parse an optional YYYY-MM-DD request input as a local date, defaulting to "now"
 * when absent. Shared by entry points (REST and GraphQL) so the same input yields
 * the same day everywhere. Throws on malformed input so the caller can surface a
 * validation error rather than silently shifting the day via `new Date(str)`.
 */
export const parseDateInput = (date?: string): Date => {
	if (!date) return new Date()
	const parsed = parseLocalDate(date)
	if (!parsed) {
		throw new Error(INVALID_DATE_MESSAGE)
	}
	return parsed
}
