import { getMoveableFeastsForDate, isInMoveableFast } from '../calendar/moveable'
import type { FastingInfo } from '../types/synaxarium'
import { getLiturgicalSeasonForDate } from './seasons'

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
const NO_FASTING: FastingInfo = { isFasting: false, fastType: null, description: null }

/**
 * Determine whether a specific day is a fasting day, in order of precedence:
 * 1. Specific moveable feasts on the date (e.g. Good Friday)
 * 2. Moveable fasting periods (Great Lent, Nineveh, Apostles')
 * 3. Static fasting days/feasts
 * 4. Weekly Wednesday/Friday fast (suspended during the Paschal season and on feasts)
 */
export const getFastingForDate = (
	date: Date,
	staticCelebrations?: Array<{ type: string; name: string }>,
): FastingInfo => {
	// Specific moveable feasts on the date take precedence over enclosing periods.
	const moveableToday = getMoveableFeastsForDate(date)
	const goodFriday = moveableToday.find((f) => f.name === 'Good Friday')
	if (goodFriday) {
		return { isFasting: true, fastType: goodFriday.type, description: goodFriday.name }
	}

	// Moveable fasting periods
	const moveableFast = isInMoveableFast(date)
	if (moveableFast) {
		return { isFasting: true, fastType: moveableFast.type, description: moveableFast.name }
	}

	// Static fasting days or feasts
	if (staticCelebrations) {
		const fastingCelebrations = staticCelebrations.filter((celeb) =>
			celeb.type.toLowerCase().includes('fast'),
		)
		const firstFast = fastingCelebrations[0]
		if (firstFast) {
			return { isFasting: true, fastType: firstFast.type, description: firstFast.name }
		}

		// Any feast suppresses the weekly fast
		const feast = staticCelebrations.find((celeb) => celeb.type.toLowerCase().includes('feast'))
		if (feast) return NO_FASTING
	}

	// Weekly Wednesday/Friday fast — except during the Paschal season
	const season = getLiturgicalSeasonForDate(date)
	if (season?.name !== 'Paschal Season' && isWeeklyFastingDay(date)) {
		const dayOfWeek = date.getDay()
		return {
			isFasting: true,
			fastType: 'fast',
			description: dayOfWeek === 3 ? 'Wednesday Fast' : 'Friday Fast',
		}
	}

	return NO_FASTING
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
export const getFastingLevel = (
	date: Date,
	staticCelebrations?: Array<{ type: string; name: string }>,
): FastingLevel => {
	const moveableToday = getMoveableFeastsForDate(date)
	if (moveableToday.some((f) => f.name === 'Good Friday')) return 'complete'

	const fasting = getFastingForDate(date, staticCelebrations)
	if (!fasting.isFasting) return 'none'

	if (fasting.description === 'Great Lent' || fasting.description === 'Holy Week') {
		return 'strict'
	}

	return 'regular'
}

/**
 * Days of the week that are traditionally fasting days (Wednesday and Friday).
 * Callers that need the full rule must also exclude the Paschal season.
 */
export const isWeeklyFastingDay = (date: Date): boolean => {
	const dayOfWeek = date.getDay()
	return dayOfWeek === 3 || dayOfWeek === 5 // Wednesday = 3, Friday = 5
}
