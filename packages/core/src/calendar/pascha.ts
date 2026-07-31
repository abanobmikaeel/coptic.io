/**
 * Easter (Pascha) calculation for the Coptic Orthodox Church
 *
 * The Coptic Orthodox Church follows the Julian calendar for calculating
 * Easter, which is the same as the Eastern Orthodox calculation.
 */
import { jdToGregorian, julianToJD } from './conversion'

export interface EasterDate {
	day: number
	month: number
	year: number
}

/**
 * Calculate the Coptic/Eastern Orthodox Easter date for a given year
 *
 * Meeus' Julian algorithm gives Pascha on the Julian calendar, which is how the
 * Church reckons it; that date is then converted to the Gregorian calendar the
 * request asked for. The conversion goes through a Julian Day Number rather than
 * adding a fixed number of days, because the gap between the calendars widens by
 * one day in every century not divisible by 400 — it was 13 days from 1900, is 14
 * from 2100, 15 from 2200. Hardcoding one offset is what used to confine this
 * function to 1900-2199; deriving it makes the arithmetic valid for any year.
 *
 * The computus is a rule rather than an astronomical prediction, so extrapolating
 * it stays liturgically correct however far out the year is.
 *
 * @param gregorianYear - The Gregorian year to calculate Easter for
 * @returns The Easter date with day, month, and year
 *
 * @see https://en.wikipedia.org/wiki/Date_of_Easter
 */
export const calculateEaster = (gregorianYear: number): EasterDate => {
	// Julian calendar Easter calculation. `d` is the epact-like offset within the
	// 19-year Metonic cycle, `e` the shift onto the following Sunday.
	const d = ((gregorianYear % 19) * 19 + 15) % 30
	const e = ((gregorianYear % 4) * 2 + (gregorianYear % 7) * 4 - d + 34) % 7

	// Days counted from March 21 (Julian), expressed as a Julian-calendar date.
	const offset = d + e + 114
	const julianMonth = Math.floor(offset / 31) // 3 = March, 4 = April
	const julianDay = (offset % 31) + 1

	const { year, month, day } = jdToGregorian(julianToJD(gregorianYear, julianMonth, julianDay))
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
