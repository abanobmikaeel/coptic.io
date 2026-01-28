import * as bible from '../../resources/bible.json'
import type { BibleBook, BibleChapter, BibleType, BibleVerse, Reading } from '../../types'

// Build indexed maps at module load for O(1) lookups
const b: BibleType = bible

// Map: bookName -> BibleBook
const booksByName = new Map<string, BibleBook>()
// Map: bookName -> Map<chapterNum, BibleChapter>
const chaptersByBook = new Map<string, Map<number, BibleChapter>>()
// Map: bookName -> Map<chapterNum, Map<verseNum, BibleVerse>>
const versesByChapter = new Map<string, Map<number, Map<number, BibleVerse>>>()

// Initialize all indexes
for (const book of b.books) {
	booksByName.set(book.name, book)

	const chapterMap = new Map<number, BibleChapter>()
	const verseMap = new Map<number, Map<number, BibleVerse>>()

	for (const chapter of book.chapters) {
		chapterMap.set(chapter.num, chapter)

		const versesInChapter = new Map<number, BibleVerse>()
		for (const verse of chapter.verses) {
			versesInChapter.set(verse.num, verse)
		}
		verseMap.set(chapter.num, versesInChapter)
	}

	chaptersByBook.set(book.name, chapterMap)
	versesByChapter.set(book.name, verseMap)
}

export const getBook = (bookName: string): BibleBook | undefined => {
	return booksByName.get(bookName)
}

export const getChapter = (book: BibleBook, chapterNum: number): BibleChapter | undefined => {
	return chaptersByBook.get(book.name)?.get(chapterNum)
}

export const getVerse = (chapter: BibleChapter, verseNum: number): BibleVerse | undefined => {
	// Need to find the book this chapter belongs to
	// For efficiency, we accept the chapter object but need book context
	// Since chapter objects are unique, we can search by chapter.num in all books
	// However, this is called with book context from getChapterAndOrVerse, so we use a different approach
	return chapter.verses.find((currVerse) => currVerse.num === verseNum)
}

// Optimized verse lookup when book name is known
export const getVerseByBookChapter = (
	bookName: string,
	chapterNum: number,
	verseNum: number,
): BibleVerse | undefined => {
	return versesByChapter.get(bookName)?.get(chapterNum)?.get(verseNum)
}

export const getChapterAndOrVerse = (
	bookName: string,
	chapterNum: number,
	verseNum?: number,
): Reading => {
	const book = getBook(bookName)
	const chapter = book && getChapter(book, chapterNum)
	let verses: BibleVerse[] = []

	if (verseNum) {
		const foundVerse = chapter && getVerse(chapter, verseNum)
		if (foundVerse) {
			verses.push(foundVerse)
		}
	} else {
		verses = chapter?.verses ?? []
	}
	return {
		bookName,
		chapters: [
			{
				chapterNum,
				verses,
			},
		],
	}
}
