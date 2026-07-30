import type { TasbehaServiceId } from '@coptic/data/en/tasbeha'
import { createRoute, z } from '@hono/zod-openapi'
import { getSundayTasbeha, getTasbehaById, getTasbehaForDate } from '../services/tasbeha.service'
import { INVALID_DATE_MESSAGE, parseLocalDate } from '../utils/dateUtils'
import { createApiApp } from '../utils/openapi'

const app = createApiApp()

const SERVICE_IDS = [
	'sunday-midnight-praises',
	'monday-midnight-praises',
	'tuesday-midnight-praises',
	'wednesday-midnight-praises',
	'thursday-midnight-praises',
	'friday-midnight-praises',
	'saturday-vespers-praises',
] as const satisfies readonly TasbehaServiceId[]

// Saturday's Praise is a Vespers Praise, so the day names do not map onto service
// ids by a single suffix.
const SERVICE_BY_DAY = {
	sunday: 'sunday-midnight-praises',
	monday: 'monday-midnight-praises',
	tuesday: 'tuesday-midnight-praises',
	wednesday: 'wednesday-midnight-praises',
	thursday: 'thursday-midnight-praises',
	friday: 'friday-midnight-praises',
	saturday: 'saturday-vespers-praises',
} as const satisfies Record<string, TasbehaServiceId>

const DAY_NAMES = Object.keys(SERVICE_BY_DAY) as [
	keyof typeof SERVICE_BY_DAY,
	...Array<keyof typeof SERVICE_BY_DAY>,
]

const langQuery = z.enum(['en', 'ar', 'cop']).optional().openapi({ example: 'cop' })
const dateQuery = z.string().optional().openapi({
	example: '2026-07-27',
	description: 'Liturgical date in YYYY-MM-DD format. Defaults to today.',
})
const errorResponse = {
	400: {
		description: 'Invalid date',
		content: { 'application/json': { schema: z.object({ error: z.string() }) } },
	},
}

const SourceSchema = z.object({
	name: z.literal('Tasbeha.org'),
	url: z.string().url(),
	pageId: z.number().int(),
	accessedAt: z.string(),
	corroboratingUrls: z.array(z.string().url()).optional(),
})

const TasbehaResponseSchema = z
	.object({
		type: z.literal('tasbeha'),
		id: z.enum(SERVICE_IDS),
		name: z.string(),
		description: z.string(),
		status: z.literal('complete'),
		rite: z.object({
			cycle: z.enum(['annual', 'kiahk', 'great-lent', 'holy-fifty', 'feast']),
			dayTune: z.enum(['adam', 'watos']),
			weekdays: z.array(z.number().int().min(0).max(6)),
		}),
		sections: z.array(
			z.object({
				id: z.string(),
				type: z.literal('prayer'),
				role: z.literal('all'),
				kind: z.enum([
					'opening',
					'canticle',
					'lobsh',
					'psali',
					'commemoration',
					'doxology',
					'theotokia',
					'gospel',
					'difnar',
					'litany',
					'conclusion',
				]),
				title: z.string(),
				titleLanguage: z.enum(['en', 'ar', 'cop']).optional(),
				content: z.array(z.string()),
				source: SourceSchema,
			}),
		),
	})
	.openapi('TasbehaService')

// Resolves the service for the date's day of the week: the six Midnight Praises
// Sunday–Friday, and the Saturday Vespers Praise.
const getForDateRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Tasbeha'],
	summary: "Get the Psalmody for a date's day of the week",
	description:
		"Returns the annual Tasbeha prayed on the given date's weekday, in source-aligned English, Coptic, or Arabic. Sunday through Friday resolve to that day's Midnight Praises; Saturday resolves to the Saturday Vespers Praise.",
	request: { query: z.object({ lang: langQuery, date: dateQuery }) },
	responses: {
		200: {
			description: "The annual Psalmody for the date's weekday",
			content: { 'application/json': { schema: TasbehaResponseSchema } },
		},
		...errorResponse,
	},
})

app.openapi(getForDateRoute, (c) => {
	const { lang = 'en', date: dateParam } = c.req.valid('query')
	const date = dateParam ? parseLocalDate(dateParam) : new Date()
	if (!date) return c.json({ error: INVALID_DATE_MESSAGE }, 400)
	if (!dateParam) c.header('Cache-Control', 'public, max-age=120, s-maxage=120')
	return c.json(getTasbehaForDate(date, lang), 200)
})

const getSundayRoute = createRoute({
	method: 'get',
	path: '/sunday',
	tags: ['Tasbeha'],
	summary: 'Get the annual Sunday Midnight Praises',
	description:
		'Returns the annual Sunday (Adam) Tasbeha corpus in source-aligned English, Coptic, or Arabic.',
	request: { query: z.object({ lang: langQuery, date: dateQuery }) },
	responses: {
		200: {
			description: 'Annual Sunday Midnight Praises',
			content: { 'application/json': { schema: TasbehaResponseSchema } },
		},
		...errorResponse,
	},
})

app.openapi(getSundayRoute, (c) => {
	const { lang = 'en', date: dateParam } = c.req.valid('query')
	const date = dateParam ? parseLocalDate(dateParam) : new Date()
	if (!date) return c.json({ error: INVALID_DATE_MESSAGE }, 400)
	if (!dateParam) c.header('Cache-Control', 'public, max-age=120, s-maxage=120')
	return c.json(getSundayTasbeha(lang, date), 200)
})

// Registered after /sunday so that path keeps its own documented entry.
const getByDayRoute = createRoute({
	method: 'get',
	path: '/{day}',
	tags: ['Tasbeha'],
	summary: 'Get the Psalmody for a named day of the week',
	description:
		"Returns a specific day's annual Psalmody regardless of today's date. The `date` query still governs the date-limited final parts of the Sunday Theotokia.",
	request: {
		params: z.object({
			day: z.enum(DAY_NAMES).openapi({
				param: { name: 'day', in: 'path' },
				example: 'wednesday',
			}),
		}),
		query: z.object({ lang: langQuery, date: dateQuery }),
	},
	responses: {
		200: {
			description: "The named day's annual Psalmody",
			content: { 'application/json': { schema: TasbehaResponseSchema } },
		},
		...errorResponse,
	},
})

app.openapi(getByDayRoute, (c) => {
	const { day } = c.req.valid('param')
	const { lang = 'en', date: dateParam } = c.req.valid('query')
	const date = dateParam ? parseLocalDate(dateParam) : new Date()
	if (!date) return c.json({ error: INVALID_DATE_MESSAGE }, 400)
	if (!dateParam) c.header('Cache-Control', 'public, max-age=120, s-maxage=120')
	return c.json(getTasbehaById(SERVICE_BY_DAY[day], lang, date), 200)
})

export default app
