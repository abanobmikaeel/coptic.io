import { getLiturgicalName, gregorianToCoptic, localizeCopticDate } from '@coptic/core'
import { localizeReference } from '@coptic/data'
import { Hono } from 'hono'
import { getByCopticDate, warmTranslation } from '../models/readings'
import type { BibleTranslation } from '../types'
import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'
import { parseLocalDate } from '../utils/dateUtils'

const readings = new Hono()

// Reading-reference fields whose values are verse strings ("Psalms 99:6-7").
const REFERENCE_KEYS = [
	'Prophecies',
	'VPsalm',
	'VGospel',
	'MPsalm',
	'MGospel',
	'Pauline',
	'Catholic',
	'Acts',
	'LPsalm',
	'LGospel',
	'EPPsalm',
	'EPGospel',
] as const

const localizeReferenceObject = (reference: Record<string, unknown>, lang: string) => {
	const out: Record<string, unknown> = { ...reference }
	for (const key of REFERENCE_KEYS) {
		if (typeof out[key] === 'string') out[key] = localizeReference(out[key] as string, lang)
	}
	return out
}

// Get readings for a specific date or today
readings.get('/:date?', async (c) => {
	try {
		const dateParam = c.req.param('date')
		const isDetailed = c.req.query('detailed') === 'true'
		const langParam = c.req.query('lang')

		// Validate and default language to English
		const translation: BibleTranslation =
			langParam === 'ar' ? 'ar' : langParam === 'es' ? 'es' : langParam === 'cop' ? 'cop' : 'en'

		// Default to today
		let parsedDate = new Date()
		if (dateParam) {
			const parsed = parseLocalDate(dateParam)
			if (!parsed) {
				return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
			}
			parsedDate = parsed
		}

		// In Workers, bible data is lazy-loaded from R2 on first use per isolate.
		// In Bun dev, warmTranslation is a no-op (pre-loaded at module init).
		if (isDetailed) await warmTranslation(translation)
		const data = getByCopticDate(parsedDate, isDetailed, translation)

		// Add celebrations and the (localized) coptic date. Season name and the
		// non-detailed reference book names are localized for the requested lang.
		const celebrations = getStaticCelebrationsForDay(parsedDate)
		const fullDate = localizeCopticDate(gregorianToCoptic(parsedDate), translation)

		return c.json({
			...data,
			...(data.reference
				? { reference: localizeReferenceObject(data.reference, translation) }
				: {}),
			// `season` is localized for display; `seasonKey` keeps the canonical
			// English identity so clients can branch on season without parsing copy.
			...(data.season
				? { season: getLiturgicalName(data.season, translation), seasonKey: data.season }
				: {}),
			celebrations,
			fullDate,
		})
	} catch (error) {
		console.error('Error fetching readings:', error)
		return c.json(
			{
				error: error instanceof Error ? error.message : 'Failed to fetch readings',
			},
			500,
		)
	}
})

export default readings
