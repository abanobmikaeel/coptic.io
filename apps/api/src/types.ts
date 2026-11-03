/** Bible translations the API serves. Adding one here is the whole of what request parsing needs. */
export const BIBLE_TRANSLATIONS = ['en', 'ar', 'es', 'cop'] as const

export type BibleTranslation = (typeof BIBLE_TRANSLATIONS)[number]

/** The Katameros reading slots, in service order: Vespers, Matins, the Liturgy, the Evening Prayer. */
export const READING_SLOTS = [
	'Prophecies',
	'VPsalm',
	'VGospel',
	'MPsalm',
	'MGospel',
	'Pauline',
	'Catholic',
	'Acts',
	'LPsalm',
	'LGospel',
	'EPPsalm',
	'EPGospel',
] as const

export type ReadingSlot = (typeof READING_SLOTS)[number]

export interface BibleVerse {
	text: string
	num: number
}

export interface BibleChapter {
	verses: BibleVerse[]
	num: number
}

export interface BibleBook {
	name: string
	chapters: BibleChapter[]
}

export interface BibleType {
	books: BibleBook[]
}

export interface Reading {
	bookName: string
	chapters: {
		chapterNum: number
		verses: BibleVerse[]
	}[]
}
