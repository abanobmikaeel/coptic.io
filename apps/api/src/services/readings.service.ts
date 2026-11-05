import { getLiturgicalName, gregorianToCoptic, localizeCopticDate } from '@coptic/core'
import { localizeReference } from '@coptic/data'
import type { ReadingsResponse } from '../schemas'
import { type BibleTranslation, READING_SLOTS } from '../types'
import { warmTranslation } from './bible/data'
import { getCelebrationsForDate } from './celebrations.service'
import { getByCopticDate } from './lectionary.service'

type ReadingReference = NonNullable<ReadingsResponse['reference']>

const localizeReferenceObject = (reference: ReadingReference, lang: string): ReadingReference => {
	const out = { ...reference }
	for (const slot of READING_SLOTS) {
		const citation = out[slot]
		if (citation) out[slot] = localizeReference(citation, lang)
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
): Promise<ReadingsResponse> => {
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
