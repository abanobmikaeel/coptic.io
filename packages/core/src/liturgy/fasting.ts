import type { FastingInfo } from '../types/synaxarium'
import { isInMoveableFast } from '../calendar/moveable'

/**
 * Get fasting information for a specific date
 *
 * Checks both moveable fasting periods (based on Easter) and
 * static fasting days (based on Coptic calendar).
 *
 * @param date - The date to check
 * @param staticCelebrations - Optional array of static celebrations for the day
 * @returns Fasting information for the date
 */
export const getFastingForDate = (
	date: Date,
	staticCelebrations?: Array<{ type: string; name: string }>
): FastingInfo => {
	// Check for moveable fasting periods first
	const moveableFast = isInMoveableFast(date)
	if (moveableFast) {
		return {
			isFasting: true,
			fastType: moveableFast.type,
			description: moveableFast.name,
		}
	}

	// Check for static fasting days if provided
	if (staticCelebrations) {
		const fastingCelebrations = staticCelebrations.filter((celeb) =>
			celeb.type.toLowerCase().includes('fast')
		)

		const firstFast = fastingCelebrations[0]
		if (firstFast) {
			return {
				isFasting: true,
				fastType: firstFast.type,
				description: firstFast.name,
			}
		}
	}

	return {
		isFasting: false,
		fastType: null,
		description: null,
	}
}

/**
 * Fasting levels in the Coptic tradition
 */
export type FastingLevel = 'none' | 'regular' | 'strict' | 'complete'

/**
 * Get the fasting level for a specific date
 *
 * @param date - The date to check
 * @returns The fasting level
 */
export const getFastingLevel = (date: Date): FastingLevel => {
	const moveableFast = isInMoveableFast(date)

	if (!moveableFast) {
		return 'none'
	}

	// Holy Week and Good Friday have stricter fasting
	if (moveableFast.name === 'Good Friday') {
		return 'complete'
	}

	// Great Lent (last week especially)
	if (moveableFast.name === 'Great Lent') {
		return 'strict'
	}

	// Other fasts
	return 'regular'
}

/**
 * Days of the week that are traditionally fasting days
 * (Wednesday and Friday, except during the 50 days after Easter)
 */
export const isWeeklyFastingDay = (date: Date): boolean => {
	const dayOfWeek = date.getDay()
	return dayOfWeek === 3 || dayOfWeek === 5 // Wednesday = 3, Friday = 5
}
