import { Reading } from '../../interfaces'
import {
	getVerseRange,
	getSingleVerse,
	getSingleChapter,
} from './verse.model'
import dayReadings from '../resources/dayReadings.json'
import uniqueReadings from '../resources/uniqueReadings.json'
const synxariumReadings: Record<
	string,
	any
> = require('../resources/synxarium.json')
import {
	verseRangePattern,
	oneVersePattern,
	oneChapterPattern,
} from '../utils/regexPatterns'
import fromGregorian from '../utils/copticDate'
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

// TODO: add ability to combine verses that have same bookName + chapter #
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

export const transformReading = (record: any, copticDate: any) => {
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

export const getByCopticDate = (gregorianDate: Date) => {
	const copticDate = fromGregorian(gregorianDate)
	const monthFound = dayReadings[copticDate.month - 1]

	if (!monthFound) {
		throw new Error('Month not found')
	}
	const readingID = monthFound?.readings[Number(copticDate.day) - 1]
	const reading = uniqueReadings.find((reading) => reading.id === readingID)
	return transformReading(reading, copticDate)
}

export const getReferencesForDate = (gregorianDate: Date) => {
	const copticDate = fromGregorian(gregorianDate)
	const monthFound = dayReadings[copticDate.month - 1]

	if (!monthFound) {
		throw new Error('Month not found')
	}
	const readingID = monthFound?.readings[Number(copticDate.day) - 1]
	const uniqueReading = uniqueReadings.find(
		(reading) => reading.id === readingID
	)
	const synxarium =
		synxariumReadings[copticDate.day + ' ' + copticDate.monthString]
	if (uniqueReading?.Day) {
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
		} = uniqueReading
		return {
			vPsalm: VPsalm,
			vGospel: VGospel,
			mPsalm: MPsalm,
			mGospel: MGospel,
			pauline: Pauline,
			catholic: Catholic,
			acts: Acts,
			lPsalm: LPsalm,
			lGospel: LGospel,
			synxarium,
		}
	} else if (!monthFound) {
		throw new Error('Reading not found')
	} else {
		throw new Error('An error has ocurred while fetching reference for date')
	}
}

export default getByCopticDate
