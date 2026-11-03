import { createRoute, z } from '@hono/zod-openapi'
import { requestDate } from '../middleware/request'
import { ErrorSchema, LentDaySchema, LentScheduleSchema } from '../schemas'
import { getLentDay, getLentSchedule } from '../services/lent.service'
import { createApiApp, jsonResponse, withOptionalLastParam } from '../utils/openapi'
import { WALL_CLOCK_CACHE_CONTROL, parseTranslation, yearParam } from '../utils/request'

const app = createApiApp()

// GET /api/lent/schedule/:year — the full 49-day schedule with computed dates
const getScheduleRoute = createRoute({
	method: 'get',
	path: '/schedule/{year}',
	tags: ['Lent'],
	summary: 'Get the Great Lent devotional schedule',
	description:
		"Returns every day of a year's Great Lent devotional with its Gregorian date. Defaults to the current year.",
	request: {
		params: z.object({ year: yearParam }),
	},
	responses: {
		200: jsonResponse(LentScheduleSchema, 'The devotional schedule'),
		400: jsonResponse(ErrorSchema, 'Invalid year'),
	},
})

for (const route of withOptionalLastParam(getScheduleRoute)) {
	app.openapi(route, async (c) => {
		const requested = c.req.param('year')
		if (!requested) c.header('Cache-Control', WALL_CLOCK_CACHE_CONTROL)
		// The year was validated when present; the bare route reads the current year
		const year = requested ? Number.parseInt(requested, 10) : new Date().getFullYear()

		return c.json(await getLentSchedule(year), 200)
	})
}

// GET /api/lent/:date — the devotional reading for a date in Great Lent
const getForDateRoute = createRoute({
	method: 'get',
	path: '/{date}',
	tags: ['Lent'],
	summary: 'Get the Great Lent devotional for a date',
	description: 'Returns the devotional reading for a day of Great Lent. Defaults to today.',
	middleware: [requestDate()] as const,
	request: {
		params: z.object({ date: z.string().openapi({ example: '2026-03-02' }) }),
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

for (const route of withOptionalLastParam(getForDateRoute)) {
	app.openapi(route, async (c) => {
		const { detailed, lang } = c.req.valid('query')
		const day = await getLentDay(c.var.date, detailed === 'true', parseTranslation(lang))
		if (!day) {
			return c.json(
				{
					error: 'No devotional reading found for this date. Date may not fall within Great Lent.',
				},
				404,
			)
		}
		return c.json(day, 200)
	})
}

export default app
