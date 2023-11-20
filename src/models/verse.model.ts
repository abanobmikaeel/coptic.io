import { range } from '../../src/utils'
import {
	getBook,
	getChapter,
	getChapterAndOrVerse,
	getVerse,
} from './bible.model'
import { BibleVerse, Reading } from '../../interfaces'

export const getSingleVerse = (verseString: string) => {
	const verseArr = splitAtIndex(
		verseString,
		verseString.lastIndexOf(' '),
		verseString.lastIndexOf(':')
	)

	return getChapterAndOrVerse(
		verseArr.bookName,
		verseArr.chapterNum,
		verseArr?.startingVerseNum
	)
}

export const getVerseRange = (verseString: string): Reading => {
	const verseArr = splitAtIndex(
		verseString,
		verseString.lastIndexOf(' '),
		verseString.lastIndexOf(':'),
		verseString.lastIndexOf('-')
	)

	const { bookName, chapterNum, startingVerseNum, endVerseNum } = verseArr
	const verses: BibleVerse[] = []
	const book = getBook(bookName)
	const chapter = book && getChapter(book, chapterNum)

	if (chapter) {
		range(startingVerseNum, endVerseNum).map((currVerse) => {
			const verseFound = getVerse(chapter, currVerse)
			verseFound && verses.push(verseFound)
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

export const getSingleChapter = (verseString: string) => {
	const verseArr = splitAtIndex(verseString, verseString.lastIndexOf(' '))
	return getChapterAndOrVerse(verseArr.bookName, Number(verseArr.chapterNum))
}

export const splitAtIndex = (
	value: string,
	index: number,
	startVerse?: number,
	endVerse?: number
) => {
	const bookName = value.substring(0, index)
	const chapterNum = startVerse
		? value.substring(index, startVerse).replace(' ', '')
		: value.substring(index)
	let startingVerseNum
	let endVerseNum = null

	if (startVerse && endVerse) {
		startingVerseNum = value
			.substring(startVerse)
			.replace(':', '')
			.split('-')[0]
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
