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
