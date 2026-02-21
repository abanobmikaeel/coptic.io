import {
	type SynaxariumEntry,
	getEasterDate,
	getLiturgicalSeasonForDate,
	gregorianToCoptic,
	toMidnight,
} from '@coptic/core'
import dayReadings from '../../resources/dayReadings.json'
import jonahReadings from '../../resources/jonahReadings.json'
import lentReadings from '../../resources/lentReadings.json'
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
	if (!verseString) return null
	const parts = verseString.split(';')
	const readings = parts.map((v) => getReading(v, translation)).filter(Boolean) as Reading[]
	return readings.length > 0 ? readings : null
}

type ReadingRecord = {
	Prophecies?: string
	VPsalm?: string
	VGospel?: string
	MPsalm?: string
	MGospel?: string
	Pauline?: string
	Catholic?: string
	Acts?: string
	LPsalm?: string
	LGospel?: string
	EPPsalm?: string
	EPGospel?: string
}

export const transformReading = (record: ReadingRecord, translation: BibleTranslation = 'en') => {
	const {
		Prophecies,
		VPsalm,
		VGospel,
		MPsalm,
		MGospel,
		Pauline,
		Catholic,
		Acts,
		LPsalm,
		LGospel,
		EPPsalm,
		EPGospel,
	} = record

	return {
		Prophecies: parseReadingString(Prophecies, translation),
		VPsalm: parseReadingString(VPsalm, translation),
		VGospel: parseReadingString(VGospel, translation),
		MPsalm: parseReadingString(MPsalm, translation),
		MGospel: parseReadingString(MGospel, translation),
		Pauline: parseReadingString(Pauline, translation),
		Catholic: parseReadingString(Catholic, translation),
		Acts: parseReadingString(Acts, translation),
		LPsalm: parseReadingString(LPsalm, translation),
		LGospel: parseReadingString(LGospel, translation),
		EPPsalm: parseReadingString(EPPsalm, translation),
		EPGospel: parseReadingString(EPGospel, translation),
	}
}

type ReadingResponse = {
	reference?: (typeof uniqueReadings)[number]
	Synaxarium: SynaxariumEntry[]
	Prophecies?: Reading[] | null
	VPsalm?: Reading[] | null
	VGospel?: Reading[] | null
	MPsalm?: Reading[] | null
	MGospel?: Reading[] | null
	Pauline?: Reading[] | null
	Catholic?: Reading[] | null
	Acts?: Reading[] | null
	LPsalm?: Reading[] | null
	LGospel?: Reading[] | null
	EPPsalm?: Reading[] | null
	EPGospel?: Reading[] | null
	season?: string
	seasonDay?: string
}

// Type for lentReadings.json entries (covers Lent, Jonah's Fast, and other moveable readings)
type LentReadingEntry = {
	label: string
	Prophecies?: string
	VPsalm?: string
	VGospel?: string
	MPsalm?: string
	MGospel?: string
	Pauline?: string
	Catholic?: string
	Acts?: string
	LPsalm?: string
	LGospel?: string
	EPPsalm?: string
	EPGospel?: string
}

// Cast the imported JSON to typed records and merge into a single lookup
const lentReadingsMap = lentReadings as Record<string, LentReadingEntry>
const jonahReadingsMap = jonahReadings as Record<string, LentReadingEntry>
const moveableReadingsMap: Record<string, LentReadingEntry> = {
	...jonahReadingsMap,
	...lentReadingsMap,
}

/**
 * Compute the day offset from Easter for a given date.
 * Returns negative numbers for days before Easter, positive for after.
 */
const getDaysFromEaster = (date: Date): number => {
	const easter = getEasterDate(date.getFullYear())
	const dateMs = toMidnight(date)
	const easterMs = toMidnight(easter)
	return Math.round((dateMs - easterMs) / (1000 * 60 * 60 * 24))
}

/**
 * Try to get Lenten readings for a date.
 * Returns the readings if the date falls during Great Lent, null otherwise.
 */
const getLentReading = (date: Date): LentReadingEntry | null => {
	const offset = getDaysFromEaster(date)
	return moveableReadingsMap[String(offset)] ?? null
}

const buildLentResponse = (
	lentReading: LentReadingEntry,
	synaxarium: SynaxariumEntry[],
	date: Date,
	isDetailed?: boolean,
	translation: BibleTranslation = 'en',
): ReadingResponse => {
	const season = getLiturgicalSeasonForDate(date)
	if (!isDetailed) {
		return { Synaxarium: synaxarium, season: season?.name, seasonDay: lentReading.label }
	}
	return {
		...transformReading(lentReading, translation),
		Synaxarium: synaxarium,
		season: season?.name,
		seasonDay: lentReading.label,
	}
}

const buildFixedResponse = (
	gregorianDate: Date,
	synaxarium: SynaxariumEntry[],
	isDetailed?: boolean,
	translation: BibleTranslation = 'en',
): ReadingResponse => {
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

	if (!isDetailed) {
		return { reference: reading, Synaxarium: synaxarium }
	}
	return { ...transformReading(reading, translation), Synaxarium: synaxarium }
}

export const getByCopticDate = (
	gregorianDate: Date,
	isDetailed?: boolean,
	translation: BibleTranslation = 'en',
): ReadingResponse => {
	if (!gregorianDate || !(gregorianDate instanceof Date)) {
		throw new Error('Invalid gregorian date provided')
	}

	const lang = translation === 'ar' ? 'ar' : 'en'
	const synaxarium = getSynaxariumForDate(gregorianDate, isDetailed, lang)
	if (!synaxarium) {
		throw new Error(`Synaxarium not found for date: ${gregorianDate.toISOString()}`)
	}

	// Moveable readings (Lent, Jonah's Fast, etc.) override fixed ones
	const lentReading = getLentReading(gregorianDate)
	if (lentReading) {
		return buildLentResponse(lentReading, synaxarium, gregorianDate, isDetailed, translation)
	}

	return buildFixedResponse(gregorianDate, synaxarium, isDetailed, translation)
}
