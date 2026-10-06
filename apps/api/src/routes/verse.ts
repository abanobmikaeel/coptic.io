import { Hono } from 'hono'
import { warmTranslation } from '../models/readings'
import { resolveDailyVerse } from '../services/daily-verse.service'
import type { BibleTranslation } from '../types'
import { INVALID_DATE_MESSAGE, parseLocalDate } from '../utils/dateUtils'

const verse = new Hono()

const toTranslation = (lang?: string): BibleTranslation =>
	lang === 'ar' ? 'ar' : lang === 'es' ? 'es' : lang === 'cop' ? 'cop' : 'en'

// Get the daily verse for a specific date or today
verse.get('/:date?', async (c) => {
	const dateParam = c.req.param('date')
	const translation = toTranslation(c.req.query('lang'))

	// Default to today
	let parsedDate = new Date()
	if (dateParam) {
		const parsed = parseLocalDate(dateParam)
		if (!parsed) {
			return c.json({ error: INVALID_DATE_MESSAGE }, 400)
		}
		parsedDate = parsed
	} else {
		c.header('Cache-Control', 'public, max-age=120, s-maxage=120')
	}

	// In Workers, bible data is lazy-loaded from R2 on first use per isolate.
	// Warm both the requested translation and English (fallback) up front.
	await warmTranslation(translation)
	if (translation !== 'en') await warmTranslation('en')

	const result = resolveDailyVerse(parsedDate, translation)
	if (!result) {
		return c.json({ error: 'No verse for date' }, 404)
	}

	return c.json(result)
})

export default verse
