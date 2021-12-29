import { Reading } from '../types/interfaces'
import {
	getVerseRange,
	getSingleVerse,
	getSingleChapter,
} from './verseTextTransformer'

/**
 *
 * @param verseString 'a string for indexing a bible verse '
 * @returns null if bad format
 */
export const getReading = (verseString: string): Reading | null => {
	const oneChapterPattern = /[0-9]* *[A-z]+ [0-9]+/ // Psalms 119
	const oneVersePattern = /[0-9]* *[A-z]+ [0-9]+:/ // Psalms 119:96
	const verseRangePattern = /[0-9]* *[A-z]+ [0-9]+:[0-9]+-[0-9]+/ // Psalms 119:96-97 convert to 119:96, 119:97

	switch (true) {
		case verseRangePattern.test(verseString):
			return getVerseRange(verseString)
		case oneVersePattern.test(verseString):
			return getSingleVerse(verseString)
		case oneChapterPattern.test(verseString):
			return getSingleChapter(verseString)
		default:
			return null
	}
}

export const parseReadingString = (verseString: string): Reading[] | null => {
	if (verseString.includes(';')) {
		let finalArr: Reading[] = []
		verseString.split(';').forEach((verse) => {
			const currVerse = getReading(verse)
			if (currVerse) {
				finalArr.push(currVerse)
			}
		})
		return finalArr
	} else {
		const foundReading = getReading(verseString)
		return foundReading ? [foundReading] : null
	}
}

const reading1 = parseReadingString('Psalms 120')
const reading2 = parseReadingString('Psalms 120:2')
const reading3 = parseReadingString('Psalms 120:2-5')
const reading4 = parseReadingString('Psalms 120:2-5;Psalms 125:2-5')

console.log(reading1 && reading1[0])
console.log(reading2 && reading2[0])
console.log(reading3 && reading3[0])
reading4 &&
	reading4.map((reading) => {
		console.log(reading.chapters)
	})
