import { range } from '../../../src/utils'
import type { BibleTranslation, BibleVerse, Reading } from '../../types'
import {
	getBook,
	getChapterAndOrVerse,
	getChapterByBookName,
	getVerseByBookChapter,
} from './bibleDataMapper'

export const getSingleVerse = (verseString: string, translation: BibleTranslation = 'en') => {
	const verseArr = splitAtIndex(
		verseString,
		verseString.lastIndexOf(' '),
		verseString.lastIndexOf(':'),
	)

	return getChapterAndOrVerse(verseArr.bookName, verseArr.chapterNum, verseArr?.startingVerseNum, translation)
}

export const getVerseRange = (verseString: string, translation: BibleTranslation = 'en'): Reading => {
	const verseArr = splitAtIndex(
		verseString,
		verseString.lastIndexOf(' '),
		verseString.lastIndexOf(':'),
		verseString.lastIndexOf('-'),
	)

	const { bookName, chapterNum, startingVerseNum, endVerseNum } = verseArr
	const verses: BibleVerse[] = []
	const book = getBook(bookName, translation)

	if (book) {
		// Use O(1) Map lookup for each verse instead of .find()
		range(startingVerseNum, endVerseNum).forEach((currVerse) => {
			const verseFound = getVerseByBookChapter(bookName, chapterNum, currVerse, translation)
			if (verseFound) {
				verses.push(verseFound)
			}
		})
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

export const getSingleChapter = (verseString: string, translation: BibleTranslation = 'en') => {
	const verseArr = splitAtIndex(verseString, verseString.lastIndexOf(' '))
	return getChapterAndOrVerse(verseArr.bookName, Number(verseArr.chapterNum), undefined, translation)
}

/**
 * Handles multi-chapter ranges like "Acts 15:36-16:5" or "2 Peter 1:19-2:8"
 * Optimized to use direct chapter lookups instead of iterating verse numbers
 */
export const getMultiChapterRange = (verseString: string, translation: BibleTranslation = 'en'): Reading => {
	// Pattern: "Book Chapter:Verse-Chapter:Verse"
	// Example: "Acts 15:36-16:5" or "2 Peter 1:19-2:8"
	const lastSpace = verseString.lastIndexOf(' ')
	const bookName = verseString.substring(0, lastSpace)
	const rangeStr = verseString.substring(lastSpace + 1) // "15:36-16:5"

	const parts = rangeStr.split('-') // ["15:36", "16:5"]
	const startPart = parts[0] ?? ''
	const endPart = parts[1] ?? ''
	const startSplit = startPart.split(':')
	const endSplit = endPart.split(':')
	const startChapterStr = startSplit[0] ?? ''
	const startVerseStr = startSplit[1] ?? ''
	const endChapterStr = endSplit[0] ?? ''
	const endVerseStr = endSplit[1] ?? ''

	const startChapter = Number(startChapterStr)
	const startVerse = Number(startVerseStr)
	const endChapter = Number(endChapterStr)
	const endVerse = Number(endVerseStr)

	const chapters: { chapterNum: number; verses: BibleVerse[] }[] = []

	for (let chapterNum = startChapter; chapterNum <= endChapter; chapterNum++) {
		// O(1) lookup via pre-built map
		const chapter = getChapterByBookName(bookName, chapterNum, translation)
		if (!chapter) continue

		let verses: BibleVerse[]

		if (chapterNum === startChapter && chapterNum === endChapter) {
			// Same chapter: filter verses in range
			verses = chapter.verses.filter((v) => v.num >= startVerse && v.num <= endVerse)
		} else if (chapterNum === startChapter) {
			// First chapter: from startVerse to end
			verses = chapter.verses.filter((v) => v.num >= startVerse)
		} else if (chapterNum === endChapter) {
			// Last chapter: from start to endVerse
			verses = chapter.verses.filter((v) => v.num <= endVerse)
		} else {
			// Middle chapter: all verses
			verses = chapter.verses
		}

		if (verses.length > 0) {
			chapters.push({ chapterNum, verses })
		}
	}

	return { bookName, chapters }
}

export const splitAtIndex = (
	value: string,
	index: number,
	startVerse?: number,
	endVerse?: number,
) => {
	const bookName = value.substring(0, index)
	const chapterNum = startVerse
		? value.substring(index, startVerse).replace(' ', '')
		: value.substring(index)
	let startingVerseNum: string | undefined
	let endVerseNum: string | null = null

	if (startVerse && endVerse) {
		startingVerseNum = value.substring(startVerse).replace(':', '').split('-')[0]
		endVerseNum = value.substring(endVerse).replace('-', '')
	} else if (startVerse) {
		startingVerseNum = value.substring(startVerse).replace(':', '')
	}
	return {
		bookName,
		chapterNum: Number(chapterNum),
		startingVerseNum: Number(startingVerseNum),
		endVerseNum: Number(endVerseNum),
	}
}
