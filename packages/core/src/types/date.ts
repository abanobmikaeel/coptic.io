/**
 * Coptic date representation
 */
export interface CopticDate {
	/** Full date string (e.g., "15 Toba") */
	dateString: string
	/** Day of the month (1-30) */
	day: number
	/** Month number (1-13, 13 being the intercalary month) */
	month: number
	/** Coptic year (Anno Martyrum) */
	year: number
	/** Month name in English */
	monthString: string
}

/**
 * Gregorian date representation for API responses
 */
export interface GregorianDate {
	/** ISO date string (YYYY-MM-DD) */
	date: string
	/** Day of the month */
	day: number
	/** Month number (1-12) */
	month: number
	/** Gregorian year */
	year: number
}

/**
 * A date that can be represented in both calendar systems
 */
export interface DualDate {
	gregorian: GregorianDate
	coptic: CopticDate
}

/**
 * Coptic month information
 */
export interface CopticMonthInfo {
	/** Month number (1-13) */
	month: number
	/** Month name */
	monthString: string
	/** Coptic year */
	year: number
	/** Starting day within a Gregorian month view */
	startDay: number
}

/**
 * Coptic month names in order
 */
export const COPTIC_MONTHS = [
	'Tout',
	'Baba',
	'Hator',
	'Kiahk',
	'Toba',
	'Amshir',
	'Baramhat',
	'Baramouda',
	'Bashans',
	'Paona',
	'Epep',
	'Mesra',
	'Nasie',
] as const

export type CopticMonthName = (typeof COPTIC_MONTHS)[number]
