import { gregorianToCoptic } from '@coptic/core'
import dayReadings from '../../resources/dayReadings.json'
import synxariumReadings from '../../resources/synxarium.json'
import uniqueReadings from '../../resources/uniqueReadings.json'
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

type SynaxariumEntry = {
	_?: string
	[key: string]: unknown
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
	reference?: unknown
	Synxarium: SynaxariumEntry[]
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

		const synxariumKey = `${copticDate.day} ${copticDate.monthString}`
		const synxarium = (synxariumReadings as Record<string, SynaxariumEntry[]>)[synxariumKey]

		if (!synxarium) {
			throw new Error(`Synxarium not found for: ${synxariumKey}`)
		}

		const synxariumWithoutText = synxarium.map((reading: SynaxariumEntry) => {
			const { _: _unused, text: _text, ...rest } = reading
			return rest
		})
		const synxariumText = isDetailed ? synxarium : synxariumWithoutText

		if (!isDetailed) {
			return { reference: reading, Synxarium: synxariumText }
		}

		const detailedReadings = transformReading(reading, translation)
		return { ...detailedReadings, Synxarium: synxariumText }
	} catch (error) {
		console.error(
			'[getByCopticDate] Error:',
			error instanceof Error ? error.message : 'Unknown error',
		)
		throw error
	}
}
