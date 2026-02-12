import { bibleData as bibleAr } from '@coptic/data/ar'
import { bibleData as bibleCop } from '@coptic/data/cop'
import { bibleData as bibleEn } from '@coptic/data/en'
import { bibleData as bibleEs } from '@coptic/data/es'
import type {
	BibleBook,
	BibleChapter,
	BibleTranslation,
	BibleType,
	BibleVerse,
	Reading,
} from '../../types'

// Build indexed maps at module load for O(1) lookups
// Separate indexes for each translation
type TranslationIndex = {
	booksByName: Map<string, BibleBook>
	chaptersByBook: Map<string, Map<number, BibleChapter>>
	versesByChapter: Map<string, Map<number, Map<number, BibleVerse>>>
}

const translationIndexes = new Map<BibleTranslation, TranslationIndex>()

function buildIndex(bible: BibleType): TranslationIndex {
	const booksByName = new Map<string, BibleBook>()
	const chaptersByBook = new Map<string, Map<number, BibleChapter>>()
	const versesByChapter = new Map<string, Map<number, Map<number, BibleVerse>>>()

	for (const book of bible.books) {
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

	return { booksByName, chaptersByBook, versesByChapter }
}

// Initialize indexes for all translations
translationIndexes.set('en', buildIndex(bibleEn as BibleType))
translationIndexes.set('ar', buildIndex(bibleAr as BibleType))
translationIndexes.set('es', buildIndex(bibleEs as BibleType))
translationIndexes.set('cop', buildIndex(bibleCop as BibleType))

function getIndex(translation: BibleTranslation = 'en'): TranslationIndex {
	const index = translationIndexes.get(translation)
	if (!index) {
		throw new Error(`Unknown translation: ${translation}`)
	}
	return index
}

export const getBook = (
	bookName: string,
	translation: BibleTranslation = 'en',
): BibleBook | undefined => {
	return getIndex(translation).booksByName.get(bookName)
}

export const getChapter = (
	book: BibleBook,
	chapterNum: number,
	translation: BibleTranslation = 'en',
): BibleChapter | undefined => {
	return getIndex(translation).chaptersByBook.get(book.name)?.get(chapterNum)
}

// O(1) chapter lookup by book name
export const getChapterByBookName = (
	bookName: string,
	chapterNum: number,
	translation: BibleTranslation = 'en',
): BibleChapter | undefined => {
	return getIndex(translation).chaptersByBook.get(bookName)?.get(chapterNum)
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
	translation: BibleTranslation = 'en',
): BibleVerse | undefined => {
	return getIndex(translation).versesByChapter.get(bookName)?.get(chapterNum)?.get(verseNum)
}

export const getChapterAndOrVerse = (
	bookName: string,
	chapterNum: number,
	verseNum?: number,
	translation: BibleTranslation = 'en',
): Reading => {
	const book = getBook(bookName, translation)
	const chapter = book && getChapter(book, chapterNum, translation)
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
