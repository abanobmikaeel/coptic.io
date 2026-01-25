import type { CopticDate } from '../types/date'
import type { FastingInfo } from '../types/synaxarium'
import { gregorianToCoptic } from '../calendar/conversion'
import { getMoveableFeastsForDate, type MoveableFeast } from '../calendar/moveable'
import { getLiturgicalSeasonForDate, type LiturgicalSeason } from './seasons'
import { getFastingForDate, type FastingLevel, getFastingLevel } from './fasting'

/**
 * Complete liturgical context for a given date
 */
export interface LiturgicalContext {
	/** The Gregorian date */
	gregorianDate: Date
	/** The corresponding Coptic date */
	copticDate: CopticDate
	/** Current liturgical season (if any) */
	season: LiturgicalSeason | null
	/** Moveable feasts on this date */
	moveableFeasts: MoveableFeast[]
	/** Fasting information */
	fasting: FastingInfo
	/** Fasting level */
	fastingLevel: FastingLevel
	/** Whether it's a Sunday */
	isSunday: boolean
	/** Day of the week (0=Sunday, 6=Saturday) */
	dayOfWeek: number
}

/**
 * Get the complete liturgical context for a date
 *
 * This provides all the information needed to determine what readings,
 * prayers, and liturgical variations should be used for a given day.
 *
 * @param date - The date to get context for
 * @param staticCelebrations - Optional static celebrations for additional fasting info
 * @returns Complete liturgical context
 */
export const getLiturgicalContext = (
	date: Date,
	staticCelebrations?: Array<{ type: string; name: string }>
): LiturgicalContext => {
	return {
		gregorianDate: date,
		copticDate: gregorianToCoptic(date),
		season: getLiturgicalSeasonForDate(date),
		moveableFeasts: getMoveableFeastsForDate(date),
		fasting: getFastingForDate(date, staticCelebrations),
		fastingLevel: getFastingLevel(date),
		isSunday: date.getDay() === 0,
		dayOfWeek: date.getDay(),
	}
}

/**
 * Check if a date is during the Holy Fifty days (Easter to Pentecost)
 *
 * @param date - The date to check
 * @returns true if in the Holy Fifty period
 */
export const isInHolyFifty = (date: Date): boolean => {
	const season = getLiturgicalSeasonForDate(date)
	return season?.name === 'Paschal Season'
}

/**
 * Check if a date is during Great Lent
 *
 * @param date - The date to check
 * @returns true if in Great Lent
 */
export const isInGreatLent = (date: Date): boolean => {
	const season = getLiturgicalSeasonForDate(date)
	return season?.name === 'Great Lent'
}

/**
 * Check if a date is during Holy Week
 *
 * @param date - The date to check
 * @returns true if in Holy Week
 */
export const isInHolyWeek = (date: Date): boolean => {
	const season = getLiturgicalSeasonForDate(date)
	return season?.name === 'Holy Week'
}

/**
 * Get the current liturgical context (for today)
 *
 * @returns Liturgical context for today
 */
export const getCurrentLiturgicalContext = (): LiturgicalContext => {
	return getLiturgicalContext(new Date())
}
