import { createRoute, z } from '@hono/zod-openapi'
import { requestDate } from '../middleware/request'
import {
	ErrorSchema,
	FastingPeriodsSchema,
	SeasonResponseSchema,
	SeasonYearSchema,
} from '../schemas'
import { getFastingPeriods, getSeasonForDate, getSeasonsForYear } from '../services/season.service'
import { createApiApp, jsonResponse, withOptionalLastParam } from '../utils/openapi'
import { parseCalendarLanguage, yearParam } from '../utils/request'

const app = createApiApp()

const yearParams = z.object({ year: yearParam })

// GET /api/season/:date
const getForDateRoute = createRoute({
	method: 'get',
	path: '/{date}',
	tags: ['Season'],
	summary: 'Get the liturgical season of a date',
	description:
		'Returns the liturgical season a Gregorian date falls in, or Ordinary Time outside the major seasons. Defaults to today.',
	middleware: [requestDate()] as const,
	request: {
		params: z.object({ date: z.string().openapi({ example: '2026-03-01' }) }),
		query: z.object({
			lang: z.string().optional().openapi({
				example: 'ar',
				description: 'en, ar or es; anything else reads English',
			}),
		}),
	},
	responses: {
		200: jsonResponse(SeasonResponseSchema, 'The season of the date'),
		400: jsonResponse(ErrorSchema, 'Invalid date'),
	},
})

for (const route of withOptionalLastParam(getForDateRoute)) {
	app.openapi(route, (c) =>
		c.json(getSeasonForDate(c.var.date, parseCalendarLanguage(c.req.valid('query').lang)), 200),
	)
}

// GET /api/season/year/:year
const getYearRoute = createRoute({
	method: 'get',
	path: '/year/{year}',
	tags: ['Season'],
	summary: 'Get the liturgical seasons of a year',
	description: 'Returns every liturgical season in a Gregorian year, with its dates.',
	request: { params: yearParams },
	responses: {
		200: jsonResponse(SeasonYearSchema, 'The seasons of the year'),
		400: jsonResponse(ErrorSchema, 'Invalid year'),
	},
})

app.openapi(getYearRoute, (c) => c.json(getSeasonsForYear(c.req.valid('param').year), 200))

// GET /api/season/fasting/:year
const getFastingPeriodsRoute = createRoute({
	method: 'get',
	path: '/fasting/{year}',
	tags: ['Season'],
	summary: 'Get the fasting periods of a year',
	description: 'Returns every fasting period in a Gregorian year, with its dates.',
	request: { params: yearParams },
	responses: {
		200: jsonResponse(FastingPeriodsSchema, 'The fasting periods of the year'),
		400: jsonResponse(ErrorSchema, 'Invalid year'),
	},
})

app.openapi(getFastingPeriodsRoute, (c) =>
	c.json(getFastingPeriods(c.req.valid('param').year), 200),
)

export default app
