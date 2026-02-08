/**
 * Coptic Bible data module - provides access to Coptic Bible text
 *
 * Uses canonical.json which combines:
 * - Bohairic dialect (primary, officially supported by the Coptic Orthodox Church)
 * - Sahidic dialect (fallback for missing books: Joshua, Judges)
 */
import canonicalData from '../../coptic/canonical.json'

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

export interface CopticBibleData {
	description: string
	books: BibleBook[]
	sources: Record<string, 'bohairic' | 'sahidic'>
	missingBooks: string[]
}

const data = canonicalData as CopticBibleData

// Book name mapping for flexible lookups (English names to canonical)
const BOOK_ALIASES: Record<string, string> = {
	// Psalms
	psalm: 'Psalms',
	psalms: 'Psalms',
	ps: 'Psalms',
	pss: 'Psalms',
	// Gospels
	matthew: 'Matthew',
	matt: 'Matthew',
	mt: 'Matthew',
	mark: 'Mark',
	mk: 'Mark',
	luke: 'Luke',
	lk: 'Luke',
	john: 'John',
	jn: 'John',
	// Other common books
	genesis: 'Genesis',
	gen: 'Genesis',
	exodus: 'Exodus',
	ex: 'Exodus',
	// Acts
	acts: 'Acts',
	// Epistles
	romans: 'Romans',
	rom: 'Romans',
	'1 corinthians': '1 Corinthians',
	'1cor': '1 Corinthians',
	'2 corinthians': '2 Corinthians',
	'2cor': '2 Corinthians',
	galatians: 'Galatians',
	gal: 'Galatians',
	ephesians: 'Ephesians',
	eph: 'Ephesians',
	philippians: 'Philippians',
	phil: 'Philippians',
	colossians: 'Colossians',
	col: 'Colossians',
	'1 thessalonians': '1 Thessalonians',
	'1thess': '1 Thessalonians',
	'2 thessalonians': '2 Thessalonians',
	'2thess': '2 Thessalonians',
	'1 timothy': '1 Timothy',
	'1tim': '1 Timothy',
	'2 timothy': '2 Timothy',
	'2tim': '2 Timothy',
	titus: 'Titus',
	philemon: 'Philemon',
	phlm: 'Philemon',
	hebrews: 'Hebrews',
	heb: 'Hebrews',
	james: 'James',
	jas: 'James',
	'1 peter': '1 Peter',
	'1pet': '1 Peter',
	'2 peter': '2 Peter',
	'2pet': '2 Peter',
	'1 john': '1 John',
	'1jn': '1 John',
	'2 john': '2 John',
	'2jn': '2 John',
	'3 john': '3 John',
	'3jn': '3 John',
	jude: 'Jude',
	revelation: 'Revelation',
	rev: 'Revelation',
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
 * Get the dialect source for a book
 */
export function getBookDialect(bookName: string): 'bohairic' | 'sahidic' | null {
	const book = getBook(bookName)
	if (!book) return null
	return data.sources[book.name] || null
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

/**
 * Get list of missing books (not available in Coptic)
 */
export function getMissingBooks(): string[] {
	return data.missingBooks
}

/**
 * Check if a book is available in Coptic
 */
export function hasBook(bookName: string): boolean {
	return getBook(bookName) !== null
}

// Export raw data for direct access (used by API)
export { canonicalData as booksData }

// Re-export in standard format for compatibility with other languages
export default {
	books: data.books,
}
