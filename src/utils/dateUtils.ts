/**
 * Shared date utility functions
 */

/**
 * Add days to a date
 */
export const addDays = (date: Date, days: number): Date => {
	const result = new Date(date)
	result.setDate(result.getDate() + days)
	return result
}

/**
 * Normalize date to local midnight to avoid timezone issues
 */
export const normalizeDate = (date: Date): Date => {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
