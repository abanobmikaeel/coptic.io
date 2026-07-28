import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { getSundayTasbeha } from '../services/tasbeha.service'
import { parseLocalDate } from '../utils/dateUtils'

const app = new OpenAPIHono()

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
		id: z.literal('sunday-midnight-praises'),
		name: z.string(),
		description: z.string(),
		status: z.literal('complete'),
		rite: z.object({
			cycle: z.literal('annual'),
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

const getSundayRoute = createRoute({
	method: 'get',
	path: '/sunday',
	tags: ['Tasbeha'],
	summary: 'Get the annual Sunday Midnight Praises',
	description:
		'Returns the annual Sunday (Adam) Tasbeha corpus in source-aligned English, Coptic, or Arabic.',
	request: {
		query: z.object({
			lang: z.enum(['en', 'ar', 'cop']).optional().openapi({ example: 'cop' }),
			date: z.string().optional().openapi({
				example: '2026-07-27',
				description: 'Liturgical date in YYYY-MM-DD format. Defaults to today.',
			}),
		}),
	},
	responses: {
		200: {
			description: 'Annual Sunday Midnight Praises',
			content: { 'application/json': { schema: TasbehaResponseSchema } },
		},
		400: {
			description: 'Invalid date',
			content: {
				'application/json': { schema: z.object({ error: z.string() }) },
			},
		},
	},
})

app.openapi(getSundayRoute, (c) => {
	const { lang = 'en', date: dateParam } = c.req.valid('query')
	const date = dateParam ? parseLocalDate(dateParam) : new Date()
	if (!date) return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
	return c.json(getSundayTasbeha(lang, date), 200)
})

export default app
