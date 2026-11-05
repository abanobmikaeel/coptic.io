import { SERVICE_LANGUAGES } from '@coptic/data/content'
import { createRoute, z } from '@hono/zod-openapi'
import { requestDate } from '../middleware/request'
import { ErrorSchema, TasbehaResponseSchema } from '../schemas'
import {
	TASBEHA_DAYS,
	getSundayTasbeha,
	getTasbehaForDate,
	getTasbehaForDay,
} from '../services/tasbeha.service'
import { createApiApp, jsonResponse } from '../utils/openapi'

const app = createApiApp()

const langQuery = z.enum(SERVICE_LANGUAGES).optional().openapi({ example: 'cop' })
const dateQuery = z.string().optional().openapi({
	example: '2026-07-27',
	description: 'Liturgical date in YYYY-MM-DD format. Defaults to today.',
})
const errorResponse = {
	400: jsonResponse(ErrorSchema, 'Invalid date'),
}

// Resolves the service for the date's day of the week: the six Midnight Praises
// Sunday–Friday, and the Saturday Vespers Praise.
const getForDateRoute = createRoute({
	method: 'get',
	path: '/',
	middleware: [requestDate('query')] as const,
	tags: ['Tasbeha'],
	summary: "Get the Psalmody for a date's day of the week",
	description:
		"Returns the Tasbeha prayed on the given date's weekday, in source-aligned English, Coptic, or Arabic. Sunday through Friday resolve to that day's Midnight Praises; Saturday resolves to the Saturday Vespers Praise.",
	request: { query: z.object({ lang: langQuery, date: dateQuery }) },
	responses: {
		200: jsonResponse(TasbehaResponseSchema, "The Psalmody for the date's weekday"),
		...errorResponse,
	},
})

app.openapi(getForDateRoute, (c) => {
	const { lang = 'en' } = c.req.valid('query')
	return c.json(getTasbehaForDate(c.var.date, lang), 200)
})

const getSundayRoute = createRoute({
	method: 'get',
	path: '/sunday',
	middleware: [requestDate('query')] as const,
	tags: ['Tasbeha'],
	summary: 'Get the Sunday Midnight Praises',
	description:
		'Returns the annual Sunday (Adam) Tasbeha corpus in source-aligned English, Coptic, or Arabic.',
	request: { query: z.object({ lang: langQuery, date: dateQuery }) },
	responses: {
		200: jsonResponse(TasbehaResponseSchema, 'Annual Sunday Midnight Praises'),
		...errorResponse,
	},
})

app.openapi(getSundayRoute, (c) => {
	const { lang = 'en' } = c.req.valid('query')
	return c.json(getSundayTasbeha(lang, c.var.date), 200)
})

// Registered after /sunday so that path keeps its own documented entry.
const getByDayRoute = createRoute({
	method: 'get',
	path: '/{day}',
	middleware: [requestDate('query')] as const,
	tags: ['Tasbeha'],
	summary: 'Get the Psalmody for a named day of the week',
	description:
		"Returns a specific day's Psalmody regardless of today's date. The `date` query still governs the date-limited final parts of the Sunday Theotokia.",
	request: {
		params: z.object({
			day: z.enum(TASBEHA_DAYS).openapi({
				param: { name: 'day', in: 'path' },
				example: 'wednesday',
			}),
		}),
		query: z.object({ lang: langQuery, date: dateQuery }),
	},
	responses: {
		200: jsonResponse(TasbehaResponseSchema, "The named day's Psalmody"),
		...errorResponse,
	},
})

app.openapi(getByDayRoute, (c) => {
	const { day } = c.req.valid('param')
	const { lang = 'en' } = c.req.valid('query')
	return c.json(getTasbehaForDay(day, lang, c.var.date), 200)
})

export default app
