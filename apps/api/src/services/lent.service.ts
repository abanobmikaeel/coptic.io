import { addDays, getDaysFromEaster, getEasterDate, toDateKey } from '@coptic/core'
import { loadLentDevotional } from '@coptic/data/en/lent'
import type { LentDay, LentSchedule } from '../schemas'
import type { BibleTranslation } from '../types'
import { warmTranslation } from './bible/data'
import { parseReadingString } from './bible/passages'

/** The year's Great Lent devotional, every day with its Gregorian date. */
export const getLentSchedule = async (year: number): Promise<LentSchedule> => {
	const easter = getEasterDate(year)
	const devotional = await loadLentDevotional()
	const days = devotional.map((entry) => ({
		...entry,
		date: toDateKey(addDays(easter, entry.dayOffset)),
	}))
	const first = days[0]
	const last = days.at(-1)
	if (!first || !last) throw new Error('The Lent devotional has no days')

	return { year, easterDate: toDateKey(easter), lentStart: first.date, lentEnd: last.date, days }
}

/**
 * The devotional reading for a date, or null outside Great Lent. Detailed, each
 * reference is resolved to its text in the translation.
 */
export const getLentDay = async (
	date: Date,
	detailed: boolean,
	translation: BibleTranslation,
): Promise<LentDay | null> => {
	const offset = getDaysFromEaster(date)
	const entry = (await loadLentDevotional()).find((d) => d.dayOffset === offset)
	if (!entry) return null

	const day = { ...entry, date: toDateKey(date) }
	if (!detailed) return day

	// In Workers, bible data is lazy-loaded from R2 on first use per isolate.
	await warmTranslation(translation)
	const resolvedReferences = entry.references
		.filter((ref) => ref !== '(TBD)')
		.map((reference) => ({ reference, readings: parseReadingString(reference, translation) }))
	return { ...day, resolvedReferences }
}
