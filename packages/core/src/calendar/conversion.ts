import type { CopticDate } from '../types/date'
import { COPTIC_MONTHS } from '../types/date'

/**
 * Pure arithmetic Coptic date conversion
 *
 * Ported from ICU (International Components for Unicode) cecal.cpp
 * Source: https://github.com/unicode-org/icu/blob/main/icu4c/source/i18n/cecal.cpp
 *
 * ~50x faster than Intl.DateTimeFormat by avoiding ICU library calls
 * and string parsing. Uses integer arithmetic only.
 */

/**
 * Julian Day Number for Coptic epoch (Tout 1, Year 1)
 * Corresponds to August 29, 284 AD (Julian calendar)
 * From ICU: COPTIC_JD_EPOCH_OFFSET = 1824665
 */
const COPTIC_JD_EPOCH_OFFSET = 1824665

/**
 * Convert Gregorian date to Julian Day Number
 *
 * Uses the standard astronomical algorithm for JDN calculation.
 * This is a continuous day count since January 1, 4713 BC (Julian calendar).
 */
/**
 * Convert Julian Day Number to Gregorian date.
 * Inverse of the JDN formula used in gregorianToJD.
 */
export function jdToGregorian(jd: number): { year: number; month: number; day: number } {
	const l = jd + 68569
	const n = Math.floor((4 * l) / 146097)
	const l2 = l - Math.floor((146097 * n + 3) / 4)
	const i = Math.floor((4000 * (l2 + 1)) / 1461001)
	const l3 = l2 - Math.floor((1461 * i) / 4) + 31
	const j = Math.floor((80 * l3) / 2447)
	const day = l3 - Math.floor((2447 * j) / 80)
	const l4 = Math.floor(j / 11)
	const month = j + 2 - 12 * l4
	const year = 100 * (n - 49) + i + l4
	return { year, month, day }
}

/**
 * Julian Day Number for a date on the JULIAN calendar.
 *
 * Same shape as gregorianToJD but without the century terms, since the Julian
 * calendar leaps every fourth year with no exceptions. Used to convert dates the
 * Church reckons on the Julian calendar — Pascha above all — into Gregorian ones
 * without hardcoding the offset between the two, which grows by a day each
 * century that is not divisible by 400.
 */
export function julianToJD(year: number, month: number, day: number): number {
	const a = Math.floor((14 - month) / 12)
	const y = year + 4800 - a
	const m = month + 12 * a - 3

	return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083
}

function gregorianToJD(year: number, month: number, day: number): number {
	// Adjust for months Jan/Feb being "13th/14th month of previous year"
	const a = Math.floor((14 - month) / 12)
	const y = year + 4800 - a
	const m = month + 12 * a - 3

	// Julian Day Number formula
	return (
		day +
		Math.floor((153 * m + 2) / 5) + // Days from March 1 to start of month
		365 * y + // Days from years
		Math.floor(y / 4) - // Add leap days (Julian calendar rule)
		Math.floor(y / 100) + // Subtract century non-leap days (Gregorian)
		Math.floor(y / 400) - // Add back 400-year leap days (Gregorian)
		32045 // Offset to epoch
	)
}

/**
 * Convert Julian Day Number to Coptic date
 *
 * Algorithm from ICU cecal.cpp jdToCE function.
 * The Coptic calendar has:
 * - 12 months of 30 days each
 * - 1 month (Nasie) of 5 days (6 in leap years)
 * - Leap year every 4 years when (year + 1) % 4 === 0
 * - 4-year cycle = 1461 days (365 + 365 + 365 + 366)
 */
function jdToCoptic(jd: number): { year: number; month: number; day: number } {
	// Days since Coptic epoch
	const jday = jd - COPTIC_JD_EPOCH_OFFSET

	// Divide into 4-year cycles (1461 days each)
	const c4 = Math.floor(jday / 1461)
	const r4 = jday - c4 * 1461

	// Year within the 4-year cycle
	// The formula handles the leap year (366 days) at the end of each cycle
	const year = 4 * c4 + Math.floor(r4 / 365) - Math.floor(r4 / 1460)

	// Day of year (0-365)
	// Special case: day 1460 of the cycle is the leap day (Nasie 6)
	const doy = r4 === 1460 ? 365 : r4 % 365

	// Each month is exactly 30 days (except Nasie which gets the remainder)
	const month = Math.floor(doy / 30) + 1
	const day = (doy % 30) + 1

	return { year, month, day }
}

/**
 * Convert a Gregorian date to a Coptic date
 *
 * @param gregorianDate - JavaScript Date object (uses local timezone)
 * @returns The corresponding Coptic date
 */
export const gregorianToCoptic = (gregorianDate: Date): CopticDate => {
	const jd = gregorianToJD(
		gregorianDate.getFullYear(),
		gregorianDate.getMonth() + 1,
		gregorianDate.getDate(),
	)
	const { year, month, day } = jdToCoptic(jd)
	const monthString = COPTIC_MONTHS[month - 1]

	return {
		dateString: `${monthString} ${day}, ${year}`,
		day,
		month,
		year,
		monthString,
	}
}

/**
 * Convert a Coptic date to a Gregorian Date object (local timezone).
 *
 * @param copticDate - The Coptic date to convert
 * @returns Corresponding Gregorian date at local midnight
 */
export const copticToGregorian = (copticDate: {
	year: number
	month: number
	day: number
}): Date => {
	const { year, month, day } = copticDate
	// Mirrors jdToCoptic, where jday 0 is Tout 1 of year 0 — so the year is counted
	// from the epoch as-is, not offset by one. Leap days land on year % 4 === 3
	// (Nasie 6), which is exactly floor(year / 4) days inserted before year `year`.
	const jday =
		COPTIC_JD_EPOCH_OFFSET + year * 365 + Math.floor(year / 4) + (month - 1) * 30 + (day - 1)
	const gregorian = jdToGregorian(jday)
	return new Date(gregorian.year, gregorian.month - 1, gregorian.day)
}

/**
 * Get the Coptic date key for synaxarium lookup
 *
 * @param date - The Gregorian date
 * @returns A string key like "15 Toba"
 */
export const getCopticDateKey = (date: Date): string => {
	const copticDate = gregorianToCoptic(date)
	return `${copticDate.day} ${copticDate.monthString}`
}

/**
 * Format a Coptic date as a human-readable string
 *
 * @param copticDate - The Coptic date to format
 * @returns Formatted string like "15 Toba 1741 AM"
 */
export const formatCopticDate = (copticDate: CopticDate): string => {
	return `${copticDate.day} ${copticDate.monthString} ${copticDate.year} AM`
}

/**
 * Get the current Coptic date
 *
 * @returns The current date in Coptic calendar
 */
export const getCurrentCopticDate = (): CopticDate => {
	return gregorianToCoptic(new Date())
}
