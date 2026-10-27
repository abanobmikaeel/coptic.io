import { getDaysFromEaster, getEasterDate } from '@coptic/core'
import { loadLentDevotional } from '@coptic/data/en/lent'
import { Hono } from 'hono'
import { requestDate } from '../middleware/request'
import { parseReadingString } from '../models/readings'
import { INVALID_YEAR_MESSAGE, addDays } from '../utils/dateUtils'
import { WALL_CLOCK_CACHE_CONTROL, parseTranslation, parseYear } from '../utils/request'

const lent = new Hono()

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
	const yearParam = c.req.param('year')
	if (!yearParam) c.header('Cache-Control', WALL_CLOCK_CACHE_CONTROL)
	const year = yearParam ? parseYear(yearParam) : new Date().getFullYear()
	if (!year) return c.json({ error: INVALID_YEAR_MESSAGE }, 400)

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
})

// GET /:date? — devotional reading for a specific date (or today)
lent.get('/:date?', requestDate(), async (c) => {
	const { date } = c.var
	const isDetailed = c.req.query('detailed') === 'true'
	const translation = parseTranslation(c.req.query('lang'))

	const offset = getDaysFromEaster(date)
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
		date: formatDate(date),
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
})

export default lent
