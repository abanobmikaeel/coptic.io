/**
 * Spanish Bible data module (Reina-Valera 1909) - provides access to Bible text for verse resolution
 * Public domain translation
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

// Book name mapping for flexible lookups (uses English canonical names)
const BOOK_ALIASES: Record<string, string> = {
	// Psalms
	psalm: 'Psalms',
	psalms: 'Psalms',
	ps: 'Psalms',
	pss: 'Psalms',
	salmo: 'Psalms',
	salmos: 'Psalms',
	// Gospels
	matthew: 'Matthew',
	matt: 'Matthew',
	mt: 'Matthew',
	mateo: 'Matthew',
	mark: 'Mark',
	mk: 'Mark',
	marcos: 'Mark',
	luke: 'Luke',
	lk: 'Luke',
	lucas: 'Luke',
	john: 'John',
	jn: 'John',
	juan: 'John',
	// Other common books
	genesis: 'Genesis',
	gen: 'Genesis',
	génesis: 'Genesis',
	exodus: 'Exodus',
	ex: 'Exodus',
	éxodo: 'Exodus',
	acts: 'Acts',
	hechos: 'Acts',
	romans: 'Romans',
	romanos: 'Romans',
	revelation: 'Revelation',
	apocalipsis: 'Revelation',
}

/**
 * Get a book by name (case-insensitive, supports aliases)
 */
export function getBook(bookName: string): BibleBook | null {
	const normalizedName = bookName.toLowerCase().trim()
	const canonicalName = BOOK_ALIASES[normalizedName] || bookName

	return data.books.find((book) => book.name.toLowerCase() === canonicalName.toLowerCase()) || null
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
 * Get the total number of verses in a chapter
 */
export function getChapterVerseCount(bookName: string, chapterNum: number): number {
	const chapter = getChapter(bookName, chapterNum)
	return chapter?.verses.length || 0
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
