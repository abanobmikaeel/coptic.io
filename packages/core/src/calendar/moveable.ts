import { addDays, startOfDay } from 'date-fns'
import type { Feast, FeastType } from '../types/feast'
import { getEasterDate } from './pascha'

/**
 * Moveable feast with additional metadata
 */
export interface MoveableFeast extends Feast {
	/** Days relative to Easter (negative = before, positive = after) */
	daysFromEaster: number
}

/**
 * Normalize a date to midnight to avoid timezone issues
 */
const normalizeDate = (date: Date): Date => {
	return startOfDay(date)
}

/**
 * Get all Easter-dependent liturgical events for a given year
 *
 * Sources:
 * - Official calendar: https://www.copticchurch.net/calendar/feasts/[YEAR]
 * - Feast classifications: https://st-takla.org/faith/en/terms/feasts.html
 * - Easter algorithm: Computus for Eastern Orthodox (Julian calendar based)
 *
 * Major Moveable Feasts (4 of 7): Palm Sunday, Easter, Ascension, Pentecost
 * Minor Moveable Feasts (2 of 7): Covenant Thursday, Thomas Sunday
 * Fasting Periods (not classified as feasts): Fast of Nineveh, Great Lent, Good Friday, Apostles' Fast
 *
 * Fixed-date feasts (not included here):
 * - Major (3): Annunciation, Nativity, Theophany
 * - Minor (5): Circumcision, Entry into Temple, Flight to Egypt, Cana, Transfiguration
 *
 * @param gregorianYear - The year to calculate feasts for
 * @returns Array of Easter-dependent events in chronological order
 */
export const getMoveableFeastsForYear = (gregorianYear: number): MoveableFeast[] => {
	const easterDateObj = getEasterDate(gregorianYear)

	const createFeast = (
		id: number,
		name: string,
		type: FeastType,
		daysFromEaster: number,
	): MoveableFeast => ({
		id,
		name,
		type,
		date: addDays(easterDateObj, daysFromEaster),
		isMoveable: true,
		daysFromEaster,
	})

	return [
		// Fast of Nineveh (3 days) - 69 days before Easter
		createFeast(1002, 'Fast of Nineveh', 'fast', -69),
		// Great Lent starts 55 days before Easter
		createFeast(1001, 'Great Lent', 'fast', -55),
		// Palm Sunday - 7 days before Easter
		createFeast(1003, 'Palm Sunday', 'majorFeast', -7),
		// Holy Thursday - 3 days before Easter
		createFeast(1004, 'Holy Thursday', 'minorFeast', -3),
		// Good Friday - 2 days before Easter
		createFeast(1005, 'Good Friday', 'fast', -2),
		// Easter Sunday
		createFeast(1006, 'Easter', 'majorFeast', 0),
		// Thomas Sunday - 7 days after Easter
		createFeast(1007, 'Thomas Sunday', 'minorFeast', 7),
		// Ascension - 39 days after Easter (40th day)
		createFeast(1008, 'Ascension', 'majorFeast', 39),
		// Pentecost - 49 days after Easter (50th day)
		createFeast(1009, 'Pentecost', 'majorFeast', 49),
		// Apostles' Fast starts the day after Pentecost
		createFeast(1010, "Apostles' Fast", 'fast', 50),
	]
}

/**
 * Get moveable feasts that fall on a specific date
 *
 * @param date - The date to check
 * @returns Array of feasts on that date (usually 0 or 1)
 */
export const getMoveableFeastsForDate = (date: Date): MoveableFeast[] => {
	const year = date.getFullYear()
	const allFeasts = getMoveableFeastsForYear(year)
	const normalizedInput = normalizeDate(date)

	return allFeasts.filter((feast) => {
		const normalizedFeast = normalizeDate(feast.date)
		return (
			normalizedFeast.getFullYear() === normalizedInput.getFullYear() &&
			normalizedFeast.getMonth() === normalizedInput.getMonth() &&
			normalizedFeast.getDate() === normalizedInput.getDate()
		)
	})
}

/**
 * Check if a date falls within a moveable fasting period
 *
 * @param date - The date to check
 * @returns The fasting period info if in a fast, null otherwise
 */
export const isInMoveableFast = (date: Date): MoveableFeast | null => {
	const year = date.getFullYear()
	const allFeasts = getMoveableFeastsForYear(year)
	const normalizedDate = normalizeDate(date)

	// Great Lent: 55 days before Easter
	const greatLent = allFeasts.find((f) => f.name === 'Great Lent')
	if (greatLent) {
		const lentStart = normalizeDate(greatLent.date)
		const lentEnd = normalizeDate(addDays(greatLent.date, 55)) // Easter Sunday
		if (normalizedDate >= lentStart && normalizedDate < lentEnd) {
			return greatLent
		}
	}

	// Fast of Nineveh: 3 days
	const nineveh = allFeasts.find((f) => f.name === 'Fast of Nineveh')
	if (nineveh) {
		const ninevehStart = normalizeDate(nineveh.date)
		const ninevehEnd = normalizeDate(addDays(nineveh.date, 3))
		if (normalizedDate >= ninevehStart && normalizedDate < ninevehEnd) {
			return nineveh
		}
	}

	// Apostles' Fast: from day after Pentecost to July 12
	const apostlesFast = allFeasts.find((f) => f.name === "Apostles' Fast")
	if (apostlesFast) {
		const apostlesStart = normalizeDate(apostlesFast.date)
		const apostlesEnd = normalizeDate(new Date(year, 6, 12)) // July 12
		if (normalizedDate >= apostlesStart && normalizedDate <= apostlesEnd) {
			return apostlesFast
		}
	}

	return null
}

/**
 * Get the name of the current moveable feast period (if any)
 *
 * @param date - The date to check
 * @returns Name of the feast period or null
 */
export const getCurrentMoveablePeriod = (date: Date): string | null => {
	const fast = isInMoveableFast(date)
	return fast?.name ?? null
}
