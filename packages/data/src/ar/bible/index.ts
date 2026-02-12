/**
 * Arabic Bible data module - provides access to Bible text for verse resolution
 */
import booksData from './books.json'

export interface BibleVerse {
	num: number
	text: string
}

export interface BibleChapter {
	num: number
	verses: BibleVerse[]
}

export interface BibleBook {
	name: string
	chapters: BibleChapter[]
}

export interface BibleData {
	books: BibleBook[]
}

const data = booksData as BibleData

/**
 * Get a book by name (case-insensitive)
 */
export function getBook(bookName: string): BibleBook | null {
	return data.books.find((book) => book.name.toLowerCase() === bookName.toLowerCase()) || null
}

/**
 * Get a specific chapter from a book
 */
export function getChapter(bookName: string, chapterNum: number): BibleChapter | null {
	const book = getBook(bookName)
	if (!book) return null

	return book.chapters.find((ch) => ch.num === chapterNum) || null
}

/**
 * Get verses from a chapter, optionally with a range
 */
export function getVerses(
	bookName: string,
	chapterNum: number,
	startVerse?: number,
	endVerse?: number,
): BibleVerse[] {
	const chapter = getChapter(bookName, chapterNum)
	if (!chapter) return []

	let verses = chapter.verses

	if (startVerse !== undefined) {
		verses = verses.filter((v) => v.num >= startVerse)
	}

	if (endVerse !== undefined) {
		verses = verses.filter((v) => v.num <= endVerse)
	}

	return verses
}

/**
 * Get all books
 */
export function getAllBooks(): BibleBook[] {
	return data.books
}

/**
 * Get book names
 */
export function getBookNames(): string[] {
	return data.books.map((book) => book.name)
}

export { booksData }
