import { type ReadingCycle, getLiturgicalSeasonForDate, getReadingCycle } from '@coptic/core'
import dayReadings from '../resources/dayReadings.json'
import holyFiftyReadings from '../resources/holyFiftyReadings.json'
import jonahReadings from '../resources/jonahReadings.json'
import lentReadings from '../resources/lentReadings.json'
import sundayReadings from '../resources/sundayReadings.json'
import uniqueReadings from '../resources/uniqueReadings.json'
import type { Reading, ReadingsResponse } from '../schemas'
import { type BibleTranslation, READING_SLOTS, type ReadingSlot } from '../types'
import { parseReadingString } from './bible/passages'
import { getSynaxariumForDate } from './synaxarium.service'

// Build indexed Map at module load for O(1) lookup by reading ID
const readingsById = new Map<number, (typeof uniqueReadings)[number]>()
for (const reading of uniqueReadings) {
	readingsById.set(reading.id, reading)
}
// A lectionary entry: a verse reference per Katameros slot
type ReadingRecord = Partial<Record<ReadingSlot, string>>

const transformReading = (record: ReadingRecord, translation: BibleTranslation) =>
	Object.fromEntries(
		READING_SLOTS.map((slot) => [slot, parseReadingString(record[slot], translation)]),
	) as Record<ReadingSlot, Reading[] | null>

// Raw verse-reference strings returned in non-detailed mode. Annual days carry the
// lectionary `id`; the seasonal and Sunday cycles don't, so both fields are optional.
type ReadingReference = NonNullable<ReadingsResponse['reference']>

/** The day's lectionary entry; readings.service adds the celebrations and Coptic date. */
type LectionaryDay = Omit<ReadingsResponse, 'celebrations' | 'fullDate' | 'seasonKey'>

// A seasonal or Sunday entry: a reading record plus the day's name in its cycle
type CycleReadingEntry = ReadingRecord & { label: string }

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

export const getByCopticDate = (
	gregorianDate: Date,
	isDetailed?: boolean,
	translation: BibleTranslation = 'en',
): LectionaryDay => {
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
	const response: LectionaryDay = {
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
