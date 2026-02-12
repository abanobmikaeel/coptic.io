import { gregorianToCoptic, type SynaxariumEntry } from '@coptic/core'
import dayReadings from '../../resources/dayReadings.json'
import uniqueReadings from '../../resources/uniqueReadings.json'
import { getSynaxariumForDate } from '../../services/synaxarium.service'
import type { BibleTranslation, Reading } from '../../types'
import {
	multiChapterRange,
	oneChapterPattern,
	oneVersePattern,
	verseRangePattern,
} from '../../utils/regexPatterns'
import {
	getMultiChapterRange,
	getSingleChapter,
	getSingleVerse,
	getVerseRange,
} from './verseTextTransformer'

// Build indexed Map at module load for O(1) lookup by reading ID
const readingsById = new Map<number, (typeof uniqueReadings)[number]>()
for (const reading of uniqueReadings) {
	readingsById.set(reading.id, reading)
}
/**
 *
 * @param verseString 'a string for indexing a bible verse '
 * @returns null if bad format
 */
export const getReading = (
	verseString: string,
	translation: BibleTranslation = 'en',
): Reading | null => {
	switch (true) {
		// Check multi-chapter range first (more specific pattern)
		case multiChapterRange.test(verseString):
			return getMultiChapterRange(verseString, translation)
		case verseRangePattern.test(verseString):
			return getVerseRange(verseString, translation)
		case oneVersePattern.test(verseString):
			return getSingleVerse(verseString, translation)
		case oneChapterPattern.test(verseString):
			return getSingleChapter(verseString, translation)
		default:
			return null
	}
}

// TODO: add ability to combine verses that have same bookName + chapter #
export const parseReadingString = (
	verseString?: string,
	translation: BibleTranslation = 'en',
): Reading[] | null => {
	if (!verseString) {
		return null
	}
	if (verseString.includes(';')) {
		const finalArr: Reading[] = []
		verseString.split(';').forEach((verse) => {
			const currVerse = getReading(verse, translation)
			if (currVerse) {
				finalArr.push(currVerse)
			}
		})
		return finalArr
	}
	const foundReading = getReading(verseString, translation)
	return foundReading ? [foundReading] : null
}

type ReadingRecord = {
	VPsalm?: string
	VGospel?: string
	MPsalm?: string
	MGospel?: string
	Pauline?: string
	Catholic?: string
	Acts?: string
	LPsalm?: string
	LGospel?: string
}

export const transformReading = (record: ReadingRecord, translation: BibleTranslation = 'en') => {
	const { VPsalm, VGospel, MPsalm, MGospel, Pauline, Catholic, Acts, LPsalm, LGospel } = record

	return {
		VPsalm: parseReadingString(VPsalm, translation),
		VGospel: parseReadingString(VGospel, translation),
		MPsalm: parseReadingString(MPsalm, translation),
		MGospel: parseReadingString(MGospel, translation),
		Pauline: parseReadingString(Pauline, translation),
		Catholic: parseReadingString(Catholic, translation),
		Acts: parseReadingString(Acts, translation),
		LPsalm: parseReadingString(LPsalm, translation),
		LGospel: parseReadingString(LGospel, translation),
	}
}

type ReadingResponse = {
	reference?: typeof uniqueReadings[number]
	Synaxarium: SynaxariumEntry[]
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
	isDetailed?: boolean,
	translation: BibleTranslation = 'en',
): ReadingResponse => {
	try {
		if (!gregorianDate || !(gregorianDate instanceof Date)) {
			throw new Error('Invalid gregorian date provided')
		}

		const copticDate = gregorianToCoptic(gregorianDate)
		const monthFound = dayReadings[copticDate.month - 1]

		if (!monthFound) {
			throw new Error(`Month not found: ${copticDate.month}`)
		}

		const dayIndex = Number(copticDate.day) - 1
		const readingID = monthFound?.readings[dayIndex]

		if (!readingID) {
			throw new Error(`No reading found for day: ${copticDate.day}`)
		}

		const reading = readingsById.get(readingID)
		if (!reading) {
			throw new Error(`Reading not found for ID: ${readingID}`)
		}

		// Use synaxarium service for consistent processing
		const lang = translation === 'ar' ? 'ar' : 'en'
		const synaxarium = getSynaxariumForDate(gregorianDate, isDetailed, lang)

		if (!synaxarium) {
			throw new Error(`Synaxarium not found for date: ${gregorianDate.toISOString()}`)
		}

		if (!isDetailed) {
			return { reference: reading, Synaxarium: synaxarium }
		}

		const detailedReadings = transformReading(reading, translation)
		return { ...detailedReadings, Synaxarium: synaxarium }
	} catch (error) {
		console.error(
			'[getByCopticDate] Error:',
			error instanceof Error ? error.message : 'Unknown error',
		)
		throw error
	}
}
