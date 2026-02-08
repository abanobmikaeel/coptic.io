export type BibleTranslation = 'en' | 'ar' | 'es'

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

export interface CustomError {
	message: string
	errors?: Error[]
	status?: number
	isPublic?: boolean
	isOperational?: boolean
	stack?: unknown
}

export interface CopticDate {
	dateString: string
	day: number
	month: number
	year: number
	monthString: string
}

export interface FastingInfo {
	isFasting: boolean
	fastType: string | null
	description: string | null
}

export interface CalendarDay {
	gregorianDate: string
	copticDate: CopticDate
	fasting: FastingInfo
}

export interface CopticMonthInfo {
	month: number
	monthString: string
	year: number
	startDay: number
}

export interface CalendarMonth {
	year: number
	month: number
	monthName: string
	days: CalendarDay[]
	copticMonths: CopticMonthInfo[]
}
