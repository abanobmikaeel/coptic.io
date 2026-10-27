import { getLiturgicalName, gregorianToCoptic, localizeCopticDate } from '@coptic/core'
import { localizeReference } from '@coptic/data'
import { getByCopticDate, warmTranslation } from '../models/readings'
import { type BibleTranslation, READING_SLOTS } from '../types'
import { getCelebrationsForDate } from './celebrations.service'

const localizeReferenceObject = (reference: Record<string, unknown>, lang: string) => {
	const out: Record<string, unknown> = { ...reference }
	for (const key of READING_SLOTS) {
		if (typeof out[key] === 'string') out[key] = localizeReference(out[key] as string, lang)
	}
	return out
}

/**
 * The day's readings as REST and GraphQL serve them: the lectionary entry plus the
 * day's celebrations and Coptic date. The season name and the non-detailed reference
 * book names are localized; `seasonKey` keeps the canonical English identity so
 * clients can branch on season without parsing copy.
 */
export const getReadingsForDate = async (
	date: Date,
	isDetailed: boolean,
	translation: BibleTranslation,
) => {
	// In Workers, bible data is lazy-loaded from R2 on first use per isolate.
	if (isDetailed) await warmTranslation(translation)
	const data = getByCopticDate(date, isDetailed, translation)

	return {
		...data,
		...(data.reference ? { reference: localizeReferenceObject(data.reference, translation) } : {}),
		...(data.season
			? { season: getLiturgicalName(data.season, translation), seasonKey: data.season }
			: {}),
		celebrations: getCelebrationsForDate(date, translation),
		fullDate: localizeCopticDate(gregorianToCoptic(date), translation),
	}
}
