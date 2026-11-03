import { getLiturgicalName } from '@coptic/core'
import { createRoute, z } from '@hono/zod-openapi'
import { requestDate } from '../middleware/request'
import { ErrorSchema, FastingDaySchema, FastingResponseSchema } from '../schemas'
import * as fastingService from '../services/fasting.service'
import { INVALID_YEAR_MESSAGE } from '../utils/dateUtils'
import { createApiApp, jsonResponse } from '../utils/openapi'
import { parseYear } from '../utils/request'

const app = createApiApp()

// GET /api/fasting/:date
const getForDateRoute = createRoute({
	method: 'get',
	path: '/:date?',
	tags: ['Fasting'],
	summary: 'Check if a date is a fasting day',
	description:
		'Returns fasting information for a specific Gregorian date. Defaults to today if no date provided.',
	middleware: [requestDate()] as const,
	request: {
		params: z.object({
			date: z.string().optional().openapi({ example: '2025-01-07' }),
		}),
		query: z.object({
			lang: z.enum(['en', 'ar', 'es']).optional().openapi({ example: 'ar' }),
		}),
	},
	responses: {
		200: jsonResponse(FastingResponseSchema, 'Fasting information'),
		400: jsonResponse(ErrorSchema, 'Invalid date format'),
	},
})

app.openapi(getForDateRoute, (c) => {
	const { lang = 'en' } = c.req.valid('query')
	const fastingInfo = fastingService.getFastingForDate(c.var.date)
	return c.json(
		{
			...fastingInfo,
			description: fastingInfo.description
				? getLiturgicalName(fastingInfo.description, lang)
				: fastingInfo.description,
		},
		200,
	)
})

// GET /api/fasting/calendar/:year
const getCalendarRoute = createRoute({
	method: 'get',
	path: '/calendar/{year}',
	tags: ['Fasting'],
	summary: 'Get fasting calendar for a year',
	description: 'Returns all fasting days in a specific Gregorian year',
	request: {
		params: z.object({
			year: z.string().openapi({ example: '2025' }),
		}),
	},
	responses: {
		200: jsonResponse(z.array(FastingDaySchema), 'Fasting calendar for the year'),
		400: jsonResponse(ErrorSchema, 'Invalid year'),
	},
})

app.openapi(getCalendarRoute, (c) => {
	const year = parseYear(c.req.valid('param').year)
	if (!year) return c.json({ error: INVALID_YEAR_MESSAGE }, 400)
	return c.json(fastingService.getFastingCalendar(year), 200)
})

export default app
