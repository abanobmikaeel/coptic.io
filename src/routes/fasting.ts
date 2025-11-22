import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import * as fastingService from '../services/fasting.service'
import { FastingResponseSchema, FastingDaySchema, ErrorSchema } from '../schemas'

const app = new OpenAPIHono()

// GET /api/fasting/:date
const getForDateRoute = createRoute({
	method: 'get',
	path: '/:date?',
	tags: ['Fasting'],
	summary: 'Check if a date is a fasting day',
	description: 'Returns fasting information for a specific Gregorian date. Defaults to today if no date provided.',
	request: {
		params: z.object({
			date: z.string().optional().openapi({ example: '2025-01-07' }),
		}),
	},
	responses: {
		200: {
			description: 'Fasting information',
			content: {
				'application/json': {
					schema: FastingResponseSchema,
				},
			},
		},
		400: {
			description: 'Invalid date format',
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
		},
	},
})

app.openapi(getForDateRoute, (c) => {
	const { date } = c.req.valid('param')
	const parsedDate = date ? new Date(date) : new Date()

	if (isNaN(parsedDate.getTime())) {
		return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
	}

	const fastingInfo = fastingService.getFastingForDate(parsedDate)
	return c.json(fastingInfo, 200)
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
		200: {
			description: 'Fasting calendar for the year',
			content: {
				'application/json': {
					schema: z.array(FastingDaySchema),
				},
			},
		},
		400: {
			description: 'Invalid year',
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
		},
	},
})

app.openapi(getCalendarRoute, (c) => {
	const { year } = c.req.valid('param')
	const yearNum = parseInt(year)

	if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
		return c.json({ error: 'Invalid year. Must be between 1900-2100' }, 400)
	}

	const calendar = fastingService.getFastingCalendar(yearNum)
	return c.json(calendar, 200)
})

export default app