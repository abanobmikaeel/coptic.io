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
	stack?: any
}
