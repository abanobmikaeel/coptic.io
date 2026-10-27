import {
	type ReadingCycle,
	type ReadingCycleName,
	type SynaxariumEntry,
	getLiturgicalSeasonForDate,
	getReadingCycle,
} from '@coptic/core'
import dayReadings from '../../resources/dayReadings.json'
import holyFiftyReadings from '../../resources/holyFiftyReadings.json'
import jonahReadings from '../../resources/jonahReadings.json'
import lentReadings from '../../resources/lentReadings.json'
import sundayReadings from '../../resources/sundayReadings.json'
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
	Day?: string
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

// Raw verse-reference strings returned in non-detailed mode. Annual days carry the
// lectionary `id`; the seasonal and Sunday cycles don't, so both fields are optional.
type ReadingReference = {
	id?: number
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

type ReadingResponse = {
	reference?: ReadingReference
	Synaxarium: SynaxariumEntry[]
	synaxariumLanguage?: string
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
	/** The lectionary cycle the day's readings come from */
	cycle: ReadingCycleName
	/** False when the day's cycle has no readings in the lectionary yet (Holy Week) */
	readingsAvailable: boolean
	season?: string
	seasonDay?: string
}

// A seasonal or Sunday entry: a reading record plus the day's name in its cycle
type CycleReadingEntry = Omit<ReadingRecord, 'Day'> & { label: string }

// Jonah's Fast, Great Lent and the Holy Fifty are keyed by days from Easter; they never overlap
const byDaysFromEaster: Record<string, CycleReadingEntry> = {
	...(jonahReadings as Record<string, CycleReadingEntry>),
	...(lentReadings as Record<string, CycleReadingEntry>),
	...(holyFiftyReadings as Record<string, CycleReadingEntry>),
}
const bySunday = sundayReadings as Record<string, CycleReadingEntry>

type CycleEntry = { record: ReadingReference; label?: string }

/**
 * The lectionary entry for a reading cycle, or null when the cycle has none yet: Holy
 * Week, whose readings follow the Pascha hours.
 */
const getCycleEntry = (cycle: ReadingCycle): CycleEntry | null => {
	switch (cycle.cycle) {
		case 'holyWeek':
			return null
		case 'annual': {
			const readingID = dayReadings[cycle.month - 1]?.readings[cycle.day - 1]
			const reading = readingID ? readingsById.get(readingID) : undefined
			if (!reading) throw new Error(`No annual reading for Coptic ${cycle.month}/${cycle.day}`)
			const { Day, ...record } = reading
			return { record }
		}
		case 'sunday': {
			const entry = bySunday[`${cycle.month}:${cycle.sunday}`]
			if (!entry) throw new Error(`No reading for Sunday ${cycle.sunday} of month ${cycle.month}`)
			const { label, ...record } = entry
			return { record, label }
		}
		default: {
			const entry = byDaysFromEaster[String(cycle.daysFromEaster)]
			if (!entry) throw new Error(`No ${cycle.cycle} reading at Easter ${cycle.daysFromEaster}`)
			const { label, ...record } = entry
			return { record, label }
		}
	}
}

// Re-export so route handlers can call warmTranslation before detailed lookups in Workers.
export { warmTranslation } from './bibleDataMapper'

export const getByCopticDate = (
	gregorianDate: Date,
	isDetailed?: boolean,
	translation: BibleTranslation = 'en',
): ReadingResponse => {
	if (!gregorianDate || !(gregorianDate instanceof Date)) {
		throw new Error('Invalid gregorian date provided')
	}

	// Synaxarium is only available in English and Arabic. Label the fallback explicitly
	// so clients know when they received English content for a Spanish/Coptic request.
	const synaxariumLanguage: 'en' | 'ar' = translation === 'ar' ? 'ar' : 'en'
	const synaxarium = getSynaxariumForDate(gregorianDate, isDetailed, synaxariumLanguage)
	if (!synaxarium) {
		throw new Error(`Synaxarium not found for date: ${gregorianDate.toISOString()}`)
	}

	const cycle = getReadingCycle(gregorianDate)
	const entry = getCycleEntry(cycle)
	const season = getLiturgicalSeasonForDate(gregorianDate)?.name
	const response: ReadingResponse = {
		Synaxarium: synaxarium,
		synaxariumLanguage,
		cycle: cycle.cycle,
		readingsAvailable: entry !== null,
		...(season ? { season } : {}),
		...(entry?.label ? { seasonDay: entry.label } : {}),
	}

	if (!entry) return response
	if (!isDetailed) return { ...response, reference: entry.record }
	return { ...response, ...transformReading(entry.record, translation) }
}
