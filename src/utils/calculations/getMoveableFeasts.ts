import easterDate from './getEaster'
import { addDays, normalizeDate } from '../dateUtils'

/**
 * Calculates all moveable feasts based on the Coptic Orthodox Easter date
 * Source: CopticChurch.net official calendar
 */

export interface MoveableFeast {
	id: number
	name: string
	type: string
	date: Date
	isMoveable: boolean
	daysFromEaster: number
}

/**
 * Get all moveable feasts for a given year
 */
export const getMoveableFeastsForYear = (
	gregorianYear: number
): MoveableFeast[] => {
	const easter = easterDate(gregorianYear)
	const easterDateObj = new Date(easter.year, easter.month - 1, easter.day)

	// Return feasts in chronological order (sorted by daysFromEaster)
	return [
		// Fast of Nineveh (3 days) - 69 days before Easter
		{
			id: 1002,
			name: 'Fast of Nineveh',
			type: 'fast',
			date: addDays(easterDateObj, -69),
			isMoveable: true,
			daysFromEaster: -69,
		},
		// Great Lent starts 55 days before Easter
		{
			id: 1001,
			name: 'Great Lent',
			type: 'fast',
			date: addDays(easterDateObj, -55),
			isMoveable: true,
			daysFromEaster: -55,
		},
		// Palm Sunday - 7 days before Easter
		{
			id: 1003,
			name: 'Palm Sunday',
			type: 'majorFeast',
			date: addDays(easterDateObj, -7),
			isMoveable: true,
			daysFromEaster: -7,
		},
		// Holy Thursday - 3 days before Easter
		{
			id: 1004,
			name: 'Holy Thursday',
			type: 'minorFeast',
			date: addDays(easterDateObj, -3),
			isMoveable: true,
			daysFromEaster: -3,
		},
		// Good Friday - 2 days before Easter
		{
			id: 1005,
			name: 'Good Friday',
			type: 'fast',
			date: addDays(easterDateObj, -2),
			isMoveable: true,
			daysFromEaster: -2,
		},
		// Easter Sunday
		{
			id: 1006,
			name: 'Easter',
			type: 'majorFeast',
			date: easterDateObj,
			isMoveable: true,
			daysFromEaster: 0,
		},
		// Thomas Sunday - 7 days after Easter
		{
			id: 1007,
			name: 'Thomas Sunday',
			type: 'minorFeast',
			date: addDays(easterDateObj, 7),
			isMoveable: true,
			daysFromEaster: 7,
		},
		// Ascension - 40 days after Easter
		{
			id: 1008,
			name: 'Ascension',
			type: 'majorFeast',
			date: addDays(easterDateObj, 39),
			isMoveable: true,
			daysFromEaster: 39,
		},
		// Pentecost - 50 days after Easter
		{
			id: 1009,
			name: 'Pentecost',
			type: 'majorFeast',
			date: addDays(easterDateObj, 49),
			isMoveable: true,
			daysFromEaster: 49,
		},
		// Apostles' Fast starts the day after Pentecost, variable length
		// Ends on July 12 (Feast of the Apostles)
		{
			id: 1010,
			name: "Apostles' Fast",
			type: 'fast',
			date: addDays(easterDateObj, 50),
			isMoveable: true,
			daysFromEaster: 50,
		},
	]
}

/**
 * Get moveable feasts for a specific date
 */
export const getMoveableFeastsForDate = (date: Date): MoveableFeast[] => {
	const year = date.getFullYear()
	const allFeasts = getMoveableFeastsForYear(year)

	// Normalize the input date to avoid timezone issues
	const normalizedInput = normalizeDate(date)

	// Filter to feasts that match the given date
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
 */
export const isInMoveableFast = (date: Date): MoveableFeast | null => {
	const year = date.getFullYear()
	const allFeasts = getMoveableFeastsForYear(year)

	// Normalize input date
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
