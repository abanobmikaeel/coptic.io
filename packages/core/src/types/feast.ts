/**
 * Types of feasts in the Coptic calendar
 */
export type FeastType = 'majorFeast' | 'minorFeast' | 'fast' | 'commemoration'

/**
 * Where a celebration ranks in the Church's calendar. The seven major and seven minor feasts
 * of the Lord are majorFeast and minorFeast; every other feast (St. Mary, the saints, the Cross,
 * Nayrouz) is otherFeast; the monthly observance of the 29th is a commemoration.
 */
export type CelebrationCategory =
	| 'majorFeast'
	| 'minorFeast'
	| 'otherFeast'
	| 'fast'
	| 'commemoration'

/**
 * A feast or celebration in the Coptic calendar
 */
export interface Feast {
	/** Unique identifier */
	id: number
	/** Name of the feast */
	name: string
	/** Type of celebration */
	type: FeastType
	/** Rank in the Church's calendar */
	category: CelebrationCategory
	/** Date of the feast */
	date: Date
	/** Whether this feast moves based on Easter */
	isMoveable: boolean
	/** Days from Easter (for moveable feasts) */
	daysFromEaster?: number
	/** Celebrated from its eve (Nativity, Theophany, Resurrection) */
	celebratedOnEve?: boolean
}

/**
 * A celebration for a specific day
 */
export interface Celebration {
	/** Unique identifier */
	id: number
	/** Name of the celebration */
	name: string
	/** @deprecated Inconsistent across fixed and moveable feasts; use `category` */
	type: string
	/** Rank in the Church's calendar */
	category: CelebrationCategory
	/** Description or additional information */
	description?: string
}

/**
 * Non-moveable celebration data from JSON
 */
export interface StaticCelebration {
	/** Coptic month number */
	month: number
	/** Coptic day number */
	day: number
	/** Celebration ID */
	id: number
	/** Name of the celebration */
	name: string
	/** Type of celebration */
	type: string
}
