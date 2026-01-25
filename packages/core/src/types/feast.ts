/**
 * Types of feasts in the Coptic calendar
 */
export type FeastType = 'majorFeast' | 'minorFeast' | 'fast' | 'commemoration'

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
	/** Date of the feast */
	date: Date
	/** Whether this feast moves based on Easter */
	isMoveable: boolean
	/** Days from Easter (for moveable feasts) */
	daysFromEaster?: number
}

/**
 * A celebration for a specific day
 */
export interface Celebration {
	/** Unique identifier */
	id: number
	/** Name of the celebration */
	name: string
	/** Type of celebration */
	type: string
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
