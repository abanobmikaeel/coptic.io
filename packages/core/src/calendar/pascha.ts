/**
 * Easter (Pascha) calculation for the Coptic Orthodox Church
 *
 * The Coptic Orthodox Church follows the Julian calendar for calculating
 * Easter, which is the same as the Eastern Orthodox calculation.
 */

export interface EasterDate {
	day: number
	month: number
	year: number
}

/**
 * Calculate the Coptic/Eastern Orthodox Easter date for a given year
 *
 * This algorithm predicts Easter dates between 1900-2199.
 * Implementation based on the Anonymous Gregorian algorithm adapted for Julian calendar.
 *
 * @param gregorianYear - The Gregorian year to calculate Easter for
 * @returns The Easter date with day, month, and year
 *
 * @see https://en.wikipedia.org/wiki/Date_of_Easter
 */
export const calculateEaster = (gregorianYear: number): EasterDate => {
	const year = gregorianYear

	// Julian calendar Easter calculation
	const k = ((year % 19) * 19 + 15) % 30
	const e = (((year % 4) * 2 + (year % 7) * 4 - k + 34) % 7) + k + 127

	// Estimate the month
	let month = Math.floor(e / 31)

	// Calculate the day
	let day = e % 31
	if (month > 4) {
		day += 1
	}
	if (year > 2099) {
		day += 1
	}

	// Adjust for month overflow
	if (day < 30) {
		day += 1
	} else {
		month += 1
		day = month - 34 + day
	}

	return { day, month, year }
}

/**
 * Get Easter as a JavaScript Date object
 *
 * @param gregorianYear - The Gregorian year
 * @returns Date object representing Easter Sunday
 */
export const getEasterDate = (gregorianYear: number): Date => {
	const easter = calculateEaster(gregorianYear)
	return new Date(easter.year, easter.month - 1, easter.day)
}

/**
 * Check if a given date is Easter Sunday
 *
 * @param date - The date to check
 * @returns true if the date is Easter Sunday
 */
export const isEasterSunday = (date: Date): boolean => {
	const easter = getEasterDate(date.getFullYear())
	return (
		date.getFullYear() === easter.getFullYear() &&
		date.getMonth() === easter.getMonth() &&
		date.getDate() === easter.getDate()
	)
}
