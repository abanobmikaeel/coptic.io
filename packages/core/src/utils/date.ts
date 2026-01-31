/** Milliseconds in a day */
export const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Add days to a date using calendar arithmetic (DST-safe)
 * Uses setDate() which correctly handles DST transitions where days may be 23 or 25 hours
 */
export const addDays = (date: Date, days: number): Date => {
	const result = new Date(date)
	result.setDate(result.getDate() + days)
	return result
}

/**
 * Get midnight timestamp for a date (for fast comparisons)
 */
export const toMidnight = (date: Date): number => {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/**
 * Compare two dates by year/month/day only (ignores time)
 * Much faster than startOfDay() which creates new Date objects
 */
export const isSameDay = (a: Date, b: Date): boolean => {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	)
}
