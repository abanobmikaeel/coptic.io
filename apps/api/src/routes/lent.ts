import { getDaysFromEaster, getEasterDate } from '@coptic/core'
import { loadLentDevotional } from '@coptic/data/en/lent'
import { createRoute, z } from '@hono/zod-openapi'
import { requestDate } from '../middleware/request'
import { parseReadingString, warmTranslation } from '../models/readings'
import { ErrorSchema, LentDaySchema, LentScheduleSchema } from '../schemas'
import { INVALID_YEAR_MESSAGE, addDays } from '../utils/dateUtils'
import { createApiApp, jsonResponse } from '../utils/openapi'
import { WALL_CLOCK_CACHE_CONTROL, parseTranslation, parseYear } from '../utils/request'

const app = createApiApp()

/**
 * Format a Date as YYYY-MM-DD
 */
const formatDate = (date: Date): string => {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

// GET /api/lent/schedule/:year — the full 49-day schedule with computed dates
const getScheduleRoute = createRoute({
	method: 'get',
	path: '/schedule/:year?',
	tags: ['Lent'],
	summary: 'Get the Great Lent devotional schedule',
	description:
		"Returns every day of a year's Great Lent devotional with its Gregorian date. Defaults to the current year.",
	request: {
		params: z.object({ year: z.string().optional().openapi({ example: '2026' }) }),
	},
	responses: {
		200: jsonResponse(LentScheduleSchema, 'The devotional schedule'),
		400: jsonResponse(ErrorSchema, 'Invalid year'),
	},
})

app.openapi(getScheduleRoute, async (c) => {
	const yearParam = c.req.valid('param').year
	if (!yearParam) c.header('Cache-Control', WALL_CLOCK_CACHE_CONTROL)
	const year = yearParam ? parseYear(yearParam) : new Date().getFullYear()
	if (!year) return c.json({ error: INVALID_YEAR_MESSAGE }, 400)

	const easter = getEasterDate(year)
	const devotional = await loadLentDevotional()

	const schedule = devotional.map((entry) => ({
		...entry,
		date: formatDate(addDays(easter, entry.dayOffset)),
	}))

	return c.json(
		{
			year,
			easterDate: formatDate(easter),
			lentStart: schedule[0]?.date,
			lentEnd: schedule[schedule.length - 1]?.date,
			days: schedule,
		},
		200,
	)
})

// GET /api/lent/:date — the devotional reading for a date in Great Lent
const getForDateRoute = createRoute({
	method: 'get',
	path: '/:date?',
	tags: ['Lent'],
	summary: 'Get the Great Lent devotional for a date',
	description: 'Returns the devotional reading for a day of Great Lent. Defaults to today.',
	middleware: [requestDate()] as const,
	request: {
		params: z.object({ date: z.string().optional().openapi({ example: '2026-03-02' }) }),
		query: z.object({
			detailed: z.string().optional().openapi({
				example: 'true',
				description: '"true" adds the verse text of each reference',
			}),
			lang: z.string().optional().openapi({
				example: 'ar',
				description: 'en, ar, es or cop; anything else reads English',
			}),
		}),
	},
	responses: {
		200: jsonResponse(LentDaySchema, 'The devotional reading'),
		400: jsonResponse(ErrorSchema, 'Invalid date'),
		404: jsonResponse(ErrorSchema, 'The date is not in Great Lent'),
	},
})

app.openapi(getForDateRoute, async (c) => {
	const { date } = c.var
	const { detailed, lang } = c.req.valid('query')

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

	const result = { ...entry, date: formatDate(date) }
	if (detailed !== 'true') return c.json(result, 200)

	// In Workers, bible data is lazy-loaded from R2 on first use per isolate.
	const translation = parseTranslation(lang)
	await warmTranslation(translation)
	const resolvedReferences = entry.references
		.filter((ref) => ref !== '(TBD)')
		.map((reference) => ({ reference, readings: parseReadingString(reference, translation) }))
	return c.json({ ...result, resolvedReferences }, 200)
})

export default app
