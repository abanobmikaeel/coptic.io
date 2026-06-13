import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { warmTranslation } from '../models/readings'
import { ErrorSchema, IncenseResponseSchema } from '../schemas'
import { getAvailableCommemorations, getIncenseForDate } from '../services/incense.service'
import { parseLocalDate } from '../utils/dateUtils'

const app = new OpenAPIHono()

const getEveningRoute = createRoute({
	method: 'get',
	path: '/evening',
	tags: ['Incense'],
	summary: 'Get the Evening Raising of Incense',
	description:
		'Returns the full Evening Raising of Incense (Vespers) service for a given date, with psalm verses and the daily gospel resolved from the readings system.',
	request: {
		query: z.object({
			date: z.string().optional().openapi({
				example: '2026-06-01',
				description: 'Date in YYYY-MM-DD format. Defaults to today.',
			}),
			lang: z.enum(['en', 'ar', 'cop']).optional().openapi({
				example: 'en',
				description: 'Language for Bible verses and liturgical text. Defaults to en.',
			}),
			commemorations: z.string().optional().openapi({
				example: 'martyrs,saint-mary',
				description:
					'Comma-separated commemoration keys (e.g. the church patron saint) to add their conditional verses. See GET /incense/commemorations.',
			}),
		}),
	},
	responses: {
		200: {
			description: 'Evening Raising of Incense service',
			content: {
				'application/json': {
					schema: IncenseResponseSchema,
				},
			},
		},
		400: {
			description: 'Invalid date format or no readings available for this date',
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
		},
	},
})

app.openapi(getEveningRoute, async (c) => {
	const { date: dateParam, lang, commemorations } = c.req.valid('query')
	const translation = lang ?? 'en'

	await warmTranslation(translation)

	let date = new Date()
	if (dateParam) {
		const parsed = parseLocalDate(dateParam)
		if (!parsed) {
			return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
		}
		date = parsed
	}

	const selected = commemorations
		? commemorations
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
		: []

	try {
		const service = getIncenseForDate(date, 'evening', translation, selected)
		return c.json(service, 200)
	} catch {
		return c.json({ error: 'No readings available for this date' }, 400)
	}
})

// Catalog of selectable commemorations (the saints/occasions with verses) — populates the picker.
const getCommemorationsRoute = createRoute({
	method: 'get',
	path: '/commemorations',
	tags: ['Incense'],
	summary: 'List selectable commemorations',
	description:
		'Returns the commemoration keys that have conditional verses, e.g. for a church-patron picker.',
	responses: {
		200: {
			description: 'Available commemoration keys',
			content: {
				'application/json': { schema: z.object({ commemorations: z.array(z.string()) }) },
			},
		},
	},
})

app.openapi(getCommemorationsRoute, (c) =>
	c.json({ commemorations: getAvailableCommemorations('evening') }, 200),
)

export default app
