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
