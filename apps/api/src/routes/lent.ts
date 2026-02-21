import { getEasterDate, toMidnight } from '@coptic/core'
import { loadLentDevotional } from '@coptic/data'
import { Hono } from 'hono'
import { parseReadingString } from '../models/readings'
import type { BibleTranslation } from '../types'
import { addDays, parseLocalDate } from '../utils/dateUtils'

const lent = new Hono()

/**
 * Compute the day offset from Easter for a given date.
 */
const getDaysFromEaster = (date: Date): number => {
	const easter = getEasterDate(date.getFullYear())
	const dateMs = toMidnight(date)
	const easterMs = toMidnight(easter)
	return Math.round((dateMs - easterMs) / (1000 * 60 * 60 * 24))
}

/**
 * Format a Date as YYYY-MM-DD
 */
const formatDate = (date: Date): string => {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

// GET /schedule/:year? — full 49-day schedule with computed dates
lent.get('/schedule/:year?', async (c) => {
	try {
		const yearParam = c.req.param('year')
		const year = yearParam ? Number.parseInt(yearParam) : new Date().getFullYear()

		if (Number.isNaN(year) || year < 1900 || year > 2199) {
			return c.json({ error: 'Invalid year. Must be between 1900 and 2199' }, 400)
		}

		const easter = getEasterDate(year)
		const devotional = await loadLentDevotional()

		const schedule = devotional.map((entry) => ({
			...entry,
			date: formatDate(addDays(easter, entry.dayOffset)),
		}))

		return c.json({
			year,
			easterDate: formatDate(easter),
			lentStart: schedule[0]?.date,
			lentEnd: schedule[schedule.length - 1]?.date,
			days: schedule,
		})
	} catch (error) {
		console.error('Error fetching lent schedule:', error)
		return c.json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch lent schedule' },
			500,
		)
	}
})

// GET /:date? — devotional reading for a specific date (or today)
lent.get('/:date?', async (c) => {
	try {
		const dateParam = c.req.param('date')
		const isDetailed = c.req.query('detailed') === 'true'
		const langParam = c.req.query('lang')

		const translation: BibleTranslation =
			langParam === 'ar' ? 'ar' : langParam === 'es' ? 'es' : langParam === 'cop' ? 'cop' : 'en'

		let parsedDate = new Date()
		if (dateParam) {
			const parsed = parseLocalDate(dateParam)
			if (!parsed) {
				return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
			}
			parsedDate = parsed
		}

		const offset = getDaysFromEaster(parsedDate)
		const devotional = await loadLentDevotional()
		const entry = devotional.find((d) => d.dayOffset === offset)

		if (!entry) {
			return c.json(
				{
					error: 'No devotional reading found for this date. Date may not fall within Great Lent.',
				},
				404,
			)
		}

		const result: Record<string, unknown> = {
			...entry,
			date: formatDate(parsedDate),
		}

		// If detailed, resolve Bible references to full text
		if (isDetailed) {
			const resolvedReferences = entry.references
				.filter((ref) => ref !== '(TBD)')
				.map((ref) => {
					const readings = parseReadingString(ref, translation)
					return { reference: ref, readings }
				})
			result.resolvedReferences = resolvedReferences
		}

		return c.json(result)
	} catch (error) {
		console.error('Error fetching lent devotional:', error)
		return c.json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch lent devotional' },
			500,
		)
	}
})

export default lent
