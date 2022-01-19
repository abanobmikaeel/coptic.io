import { Reading } from '../types/interfaces'
import {
	getVerseRange,
	getSingleVerse,
	getSingleChapter,
} from './verseTextTransformer'

import {
	verseRangePattern,
	oneVersePattern,
	oneChapterPattern,
} from '../utils/regexPatterns'

/**
 *
 * @param verseString 'a string for indexing a bible verse '
 * @returns null if bad format
 */
export const getReading = (verseString: string): Reading | null => {
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

export const transformReading = (record: any) => {
	const {
		VPsalm,
		VGospel,
		MPsalm,
		MGospel,
		Pauline,
		Catholic,
		Acts,
		LPsalm,
		LGospel,
	} = record

	return {
		VPsalm: parseReadingString(VPsalm),
		VGospel: parseReadingString(VGospel),
		MPsalm: parseReadingString(MPsalm),
		MGospel: parseReadingString(MGospel),
		Pauline: parseReadingString(Pauline),
		Catholic: parseReadingString(Catholic),
		Acts: parseReadingString(Acts),
		LPsalm: parseReadingString(LPsalm),
		LGospel: parseReadingString(LGospel),
	}
}
