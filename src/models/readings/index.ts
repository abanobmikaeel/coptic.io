import { Reading } from '../../types'
import {
	getVerseRange,
	getSingleVerse,
	getSingleChapter,
} from './verseTextTransformer'
import dayReadings from '../../resources/dayReadings.json'
import uniqueReadings from '../../resources/uniqueReadings.json'
const synxariumReadings: Record<
	string,
	any
> = require('../../resources/synxarium.json')
import {
	verseRangePattern,
	oneVersePattern,
	oneChapterPattern,
} from '../../../src/utils/regexPatterns'
import fromGregorian from '../../../src/utils/copticDate'
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

type ReadingResponse = {
	reference?: any
	Synxarium: any[]
	VPsalm?: Reading[] | null
	VGospel?: Reading[] | null
	MPsalm?: Reading[] | null
	MGospel?: Reading[] | null
	Pauline?: Reading[] | null
	Catholic?: Reading[] | null
	Acts?: Reading[] | null
	LPsalm?: Reading[] | null
	LGospel?: Reading[] | null
}

export const getByCopticDate = (
	gregorianDate: Date,
	isDetailed?: boolean
): ReadingResponse => {
	try {
		if (!gregorianDate || !(gregorianDate instanceof Date)) {
			throw new Error('Invalid gregorian date provided')
		}

		const copticDate = fromGregorian(gregorianDate)
		const monthFound = dayReadings[copticDate.month - 1]

		if (!monthFound) {
			throw new Error(`Month not found: ${copticDate.month}`)
		}

		const dayIndex = Number(copticDate.day) - 1
		const readingID = monthFound?.readings[dayIndex]

		if (!readingID) {
			throw new Error(`No reading found for day: ${copticDate.day}`)
		}

		const reading = uniqueReadings.find((reading) => reading.id === readingID)
		if (!reading) {
			throw new Error(`Reading not found for ID: ${readingID}`)
		}

		const synxariumKey = `${copticDate.day} ${copticDate.monthString}`
		const synxarium = synxariumReadings[synxariumKey]

		if (!synxarium) {
			throw new Error(`Synxarium not found for: ${synxariumKey}`)
		}

		const synxariumWithoutText = synxarium.map((reading: any) => {
			const { text, ...rest } = reading
			return rest
		})
		const synxariumText = isDetailed ? synxarium : synxariumWithoutText

		if (!isDetailed) {
			return { reference: reading, Synxarium: synxariumText }
		}

		const detailedReadings = transformReading(reading, copticDate)
		return { ...detailedReadings, Synxarium: synxariumText }
	} catch (error) {
		console.error(
			'[getByCopticDate] Error:',
			error instanceof Error ? error.message : 'Unknown error'
		)
		throw error
	}
}
