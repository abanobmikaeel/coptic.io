import type { CopticDate } from '../types/date'

/**
 * Convert a Gregorian date to a Coptic date
 *
 * Uses the JavaScript Intl API with the Coptic calendar.
 * The Coptic calendar (Anno Martyrum) started in 284 AD.
 *
 * @param gregorianDate - The Gregorian date to convert
 * @returns The corresponding Coptic date
 */
export const gregorianToCoptic = (gregorianDate: Date): CopticDate => {
	const fullDate = new Intl.DateTimeFormat('en-u-ca-coptic', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
	const monthOnly = new Intl.DateTimeFormat('en-u-ca-coptic', {
		month: 'numeric',
	})
	const dayOnly = new Intl.DateTimeFormat('en-u-ca-coptic', { day: 'numeric' })
	const yearOnly = new Intl.DateTimeFormat('en-u-ca-coptic', {
		year: 'numeric',
	})
	const monthOnlyLong = new Intl.DateTimeFormat('en-u-ca-coptic', {
		month: 'long',
	})

	const str = fullDate.format(gregorianDate)
	const yearStr = yearOnly.format(gregorianDate)
	const monthOnlyLongStr = monthOnlyLong.format(gregorianDate)

	return {
		dateString: str.substring(0, str.length - 5),
		day: Number(dayOnly.format(gregorianDate)),
		month: Number(monthOnly.format(gregorianDate)),
		year: Number(yearStr.substring(0, yearStr.length - 5)),
		monthString: monthOnlyLongStr,
	}
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
