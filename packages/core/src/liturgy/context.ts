import { gregorianToCoptic } from '../calendar/conversion'
import { type MoveableFeast, getMoveableFeastsForDate } from '../calendar/moveable'
import type { CopticDate } from '../types/date'
import type { FastingInfo } from '../types/synaxarium'
import { type FastingLevel, getFastingForDate, getFastingLevel } from './fasting'
import { type LiturgicalSeason, getLiturgicalSeasonForDate } from './seasons'

/**
 * The two melodic modes of the Coptic rite. Most hymns exist in both, and which one is
 * sung depends on the day of the week.
 */
export type DayTune = 'adam' | 'watos'

/**
 * Get the day's tune (melodic mode): Adam on Sunday/Monday/Tuesday, Watos (Batos) on
 * Wednesday–Saturday. Named after the first words of the respective Theotokias.
 *
 * Keys off the weekday of the given liturgical date: e.g. a Saturday is Watos for both its
 * Vespers and Matins. The `date` passed in is the liturgical day the service belongs to, so
 * no sunset-shift adjustment is needed here.
 */
export const getDayTune = (date: Date): DayTune => (date.getDay() <= 2 ? 'adam' : 'watos')

/**
 * The agricultural season that determines which Litany for the Nature is prayed,
 * following Egypt's farming year.
 */
export type NatureSeason = 'waters' | 'plants' | 'fruits'

/**
 * Get the nature-litany season for a Coptic date:
 * - Waters (rising of the Nile): Paoni 12 – Paopi 9
 * - Plants (seeds and herbs):    Paopi 10 – Tobi 10
 * - Fruits (airs and harvest):   Tobi 11 – Paoni 11
 *
 * Coptic months are numbered Thout=1 … Nasie=13 (Paopi=2, Tobi=5, Paoni=10).
 */
export const getNatureSeason = ({
	month,
	day,
}: Pick<CopticDate, 'month' | 'day'>): NatureSeason => {
	if ((month === 10 && day >= 12) || month >= 11 || month === 1 || (month === 2 && day <= 9))
		return 'waters'
	if ((month === 2 && day >= 10) || month === 3 || month === 4 || (month === 5 && day <= 10))
		return 'plants'
	return 'fruits'
}

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
	/** The day's tune/melodic mode (Adam or Watos) */
	dayTune: DayTune
	/** Season of the Litany for the Nature (waters/plants/fruits) */
	natureSeason: NatureSeason
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
	staticCelebrations?: Array<{ type: string; name: string }>,
): LiturgicalContext => {
	const copticDate = gregorianToCoptic(date)
	return {
		gregorianDate: date,
		copticDate,
		season: getLiturgicalSeasonForDate(date),
		moveableFeasts: getMoveableFeastsForDate(date),
		fasting: getFastingForDate(date, staticCelebrations),
		fastingLevel: getFastingLevel(date),
		isSunday: date.getDay() === 0,
		dayOfWeek: date.getDay(),
		dayTune: getDayTune(date),
		natureSeason: getNatureSeason(copticDate),
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
