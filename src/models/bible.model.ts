import * as bible from '../resources/bible.json'
import {
	BibleBook,
	BibleChapter,
	BibleType,
	BibleVerse,
	Reading,
} from '../../interfaces'

export const getBook = (bookName: string): BibleBook | undefined => {
	const b: BibleType = bible
	return b.books.find((book) => book.name === bookName)
}

export const getChapter = (book: BibleBook, chapterNum: number) => {
	return book.chapters.find((chapter) => chapter.num == chapterNum)
}

export const getVerse = (
	chapter: BibleChapter,
	verseNum: number
): BibleVerse | undefined => {
	return chapter.verses.find((currVerse) => currVerse.num === verseNum)
}

export const getChapterAndOrVerse = (
	bookName: string,
	chapterNum: number,
	verseNum?: number
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
