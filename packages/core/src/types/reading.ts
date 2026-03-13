/**
 * A single Bible verse
 */
export interface BibleVerse {
	/** Verse text content */
	text: string
	/** Verse number within the chapter */
	num: number
}

/**
 * A chapter from the Bible
 */
export interface BibleChapter {
	/** Array of verses in the chapter */
	verses: BibleVerse[]
	/** Chapter number */
	num: number
}

/**
 * A book of the Bible
 */
export interface BibleBook {
	/** Book name (e.g., "Genesis", "Matthew") */
	name: string
	/** All chapters in the book */
	chapters: BibleChapter[]
}

/**
 * The full Bible structure
 */
export interface Bible {
	/** All books of the Bible */
	books: BibleBook[]
}

/**
 * A reading passage (portion of scripture)
 */
export interface Reading {
	/** Name of the book */
	bookName: string
	/** Chapters and verses included in this reading */
	chapters: {
		chapterNum: number
		verses: BibleVerse[]
	}[]
}

/**
 * Types of liturgical readings
 */
export type ReadingType =
	| 'vespers'
	| 'matins'
	| 'pauline'
	| 'catholic'
	| 'acts'
	| 'psalm'
	| 'gospel'

/**
 * A complete set of readings for a liturgical service
 */
export interface DailyReadings {
	/** Vespers Gospel reading */
	vespers?: Reading
	/** Matins Gospel reading */
	matins?: Reading
	/** Pauline Epistle */
	pauline?: Reading
	/** Catholic Epistle */
	catholic?: Reading
	/** Acts of the Apostles */
	acts?: Reading
	/** Psalm selection */
	psalm?: Reading
	/** Liturgy Gospel reading */
	gospel?: Reading
}

/**
 * Source information for readings
 */
export interface ReadingSource {
	/** Source identifier */
	id: string
	/** Source name */
	name: string
	/** Source URL if available */
	url?: string
}

/**
 * A sermon linked to a Lent devotional day
 */
export interface LentDevotionalSermon {
	title: string
	preacher?: string
	youtubeUrl: string
	thumbnail?: string
}

/**
 * A single day's entry in the Lent devotional guide
 */
export interface LentDevotionalReading {
	/** Days from Easter (e.g., -55 for day 1 of Lent) */
	dayOffset: number
	/** Day number within the 49-day Lent period (1-49) */
	dayNumber: number
	/** Part of Lent ("One" or "Two") */
	part: string
	/** Week number (1-7) */
	weekNumber: number
	/** Theme for the week */
	weekTheme: string
	/** Day of the week */
	day: string
	/** Daily theme title */
	title: string
	/** Bible reference strings */
	references: string[]
	/** Optional sermon links */
	sermons?: LentDevotionalSermon[]
	/** Sunday gospel reading description */
	sundayHolyGospelReading?: string
}
