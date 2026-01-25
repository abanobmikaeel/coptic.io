/**
 * Metadata for tracking data sources
 */
export interface DataMeta {
	/** Source identifier (e.g., "st-takla", "suscopts") */
	source?: string
	/** Language code (e.g., "en", "ar", "cop") */
	language: string
	/** Version or date of the data */
	version: string
	/** Source URL if available */
	url?: string
	/** Review status */
	status: 'raw' | 'reviewed' | 'canonical'
	/** Multiple sources for canonical files */
	sources?: string[]
}

/**
 * A synaxarium entry (saint commemoration or event)
 */
export interface SynaxariumEntry {
	/** Unique identifier */
	id?: string
	/** Name of the saint or event */
	name: string
	/** Full text of the entry */
	text?: string
	/** Source URL */
	url?: string
	/** Source reference for canonical entries */
	sourceRef?: string
}

/**
 * A synaxarium file structure with metadata
 */
export interface SynaxariumFile {
	/** Metadata about the file */
	_meta: DataMeta
	/** Entries indexed by Coptic date (e.g., "15 Toba") */
	entries: Record<string, SynaxariumEntry[]>
}

/**
 * Search result from synaxarium
 */
export interface SynaxariumSearchResult {
	/** Coptic date key */
	date: string
	/** Coptic date information */
	copticDate: {
		dateString: string
		day: number
		monthString: string
	}
	/** Matching entry */
	entry: {
		url?: string
		name?: string
	}
}

/**
 * Fasting information for a day
 */
export interface FastingInfo {
	/** Whether it's a fasting day */
	isFasting: boolean
	/** Type of fast (e.g., "fast", "strict fast") */
	fastType: string | null
	/** Description of the fast */
	description: string | null
}

/**
 * Calendar day information
 */
export interface CalendarDay {
	/** Gregorian date (YYYY-MM-DD) */
	gregorianDate: string
	/** Coptic date */
	copticDate: {
		dateString: string
		day: number
		month: number
		year: number
		monthString: string
	}
	/** Fasting information */
	fasting: FastingInfo
}

/**
 * Calendar month information
 */
export interface CalendarMonth {
	/** Gregorian year */
	year: number
	/** Gregorian month (1-12) */
	month: number
	/** Month name */
	monthName: string
	/** Days in the month */
	days: CalendarDay[]
	/** Coptic months that overlap with this Gregorian month */
	copticMonths: {
		month: number
		monthString: string
		year: number
		startDay: number
	}[]
}
