import {
	getAllSeasonsForYear,
	getFastingPeriodsForYear,
	getLiturgicalDescription,
	getLiturgicalName,
	getLiturgicalSeasonForDate,
	isInFastingPeriod,
	toDateKey,
} from '@coptic/core'
import { createRoute, z } from '@hono/zod-openapi'
import { requestDate } from '../middleware/request'
import {
	ErrorSchema,
	FastingPeriodsSchema,
	SeasonResponseSchema,
	SeasonYearSchema,
} from '../schemas'
import { createApiApp, jsonResponse, withOptionalLastParam } from '../utils/openapi'
import { yearParam } from '../utils/request'

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
	app.openapi(route, (c) => {
		const { date } = c.var
		const langQuery = c.req.valid('query').lang
		const lang = langQuery && ['en', 'ar', 'es'].includes(langQuery) ? langQuery : 'en'
		const currentSeason = getLiturgicalSeasonForDate(date)
		const isFasting = isInFastingPeriod(date)

		if (!currentSeason) {
			return c.json(
				{
					date: toDateKey(date),
					season: getLiturgicalName('Ordinary Time', lang),
					description: getLiturgicalDescription(
						'Ordinary Time',
						'Regular liturgical time outside major seasons',
						lang,
					),
					isFasting: false,
				},
				200,
			)
		}

		return c.json(
			{
				date: toDateKey(date),
				season: getLiturgicalName(currentSeason.name, lang),
				description: getLiturgicalDescription(currentSeason.name, currentSeason.description, lang),
				startDate: toDateKey(currentSeason.startDate),
				endDate: toDateKey(currentSeason.endDate),
				isFasting,
				type: currentSeason.type,
			},
			200,
		)
	})
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

app.openapi(getYearRoute, (c) => {
	const { year } = c.req.valid('param')

	const seasons = getAllSeasonsForYear(year)

	return c.json(
		{
			year,
			seasons: seasons.map((s) => ({
				name: s.name,
				description: s.description,
				startDate: toDateKey(s.startDate),
				endDate: toDateKey(s.endDate),
				isFasting: s.isFasting,
				type: s.type,
			})),
		},
		200,
	)
})

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

app.openapi(getFastingPeriodsRoute, (c) => {
	const { year } = c.req.valid('param')

	const fastingPeriods = getFastingPeriodsForYear(year)

	return c.json(
		{
			year,
			fastingPeriods: fastingPeriods.map((f) => ({
				name: f.name,
				description: f.description,
				startDate: toDateKey(f.startDate),
				endDate: toDateKey(f.endDate),
				type: f.type,
			})),
		},
		200,
	)
})

export default app
