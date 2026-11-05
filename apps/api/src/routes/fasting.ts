import { createRoute, z } from '@hono/zod-openapi'
import { requestDate } from '../middleware/request'
import { ErrorSchema, FastingDaySchema, FastingResponseSchema } from '../schemas'
import * as fastingService from '../services/fasting.service'
import { createApiApp, jsonResponse, withOptionalLastParam } from '../utils/openapi'
import { CALENDAR_LANGUAGES, yearParam } from '../utils/request'

const app = createApiApp()

// GET /api/fasting/:date
const getForDateRoute = createRoute({
	method: 'get',
	path: '/{date}',
	tags: ['Fasting'],
	summary: 'Check if a date is a fasting day',
	description:
		'Returns fasting information for a specific Gregorian date. Defaults to today if no date provided.',
	middleware: [requestDate()] as const,
	request: {
		params: z.object({
			date: z.string().openapi({ example: '2025-01-07' }),
		}),
		query: z.object({
			lang: z.enum(CALENDAR_LANGUAGES).optional().openapi({ example: 'ar' }),
		}),
	},
	responses: {
		200: jsonResponse(FastingResponseSchema, 'Fasting information'),
		400: jsonResponse(ErrorSchema, 'Invalid date format'),
	},
})

for (const route of withOptionalLastParam(getForDateRoute)) {
	app.openapi(route, (c) => {
		const { lang } = c.req.valid('query')
		return c.json(fastingService.getFastingForDate(c.var.date, lang), 200)
	})
}

// GET /api/fasting/calendar/:year
const getCalendarRoute = createRoute({
	method: 'get',
	path: '/calendar/{year}',
	tags: ['Fasting'],
	summary: 'Get fasting calendar for a year',
	description: 'Returns all fasting days in a specific Gregorian year',
	request: {
		params: z.object({
			year: yearParam,
		}),
	},
	responses: {
		200: jsonResponse(z.array(FastingDaySchema), 'Fasting calendar for the year'),
		400: jsonResponse(ErrorSchema, 'Invalid year'),
	},
})

app.openapi(getCalendarRoute, (c) => {
	return c.json(fastingService.getFastingCalendar(c.req.valid('param').year), 200)
})

export default app
