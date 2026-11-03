import { createRoute, z } from '@hono/zod-openapi'
import { bibleTranslation, requestDate } from '../middleware/request'
import { ErrorSchema, IncenseResponseSchema } from '../schemas'
import { getAvailableCommemorations, getIncenseForDate } from '../services/incense.service'
import { createApiApp, jsonResponse } from '../utils/openapi'

const app = createApiApp()

// Matins and Vespers are the same rite with different slots, so they share one route
// definition; only the path, the wording and the reading slots differ.
const SERVICES = {
	evening: {
		summary: 'Get the Evening Raising of Incense',
		description:
			'Returns the full Evening Raising of Incense (Vespers) for a given date, with psalm verses and the daily gospel resolved from the readings system.',
	},
	morning: {
		summary: 'Get the Morning Raising of Incense',
		description:
			"Returns the full Morning Raising of Incense (Matins) for a given date. The rite is shared with Vespers; Matins prays the litanies of the sick, travellers and oblations, sings its own gospel response, and reads the day's Matins psalm and gospel.",
	},
} as const

const incenseRoute = (serviceType: keyof typeof SERVICES) =>
	createRoute({
		method: 'get',
		path: `/${serviceType}`,
		middleware: [requestDate('query'), bibleTranslation] as const,
		tags: ['Incense'],
		...SERVICES[serviceType],
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
			200: jsonResponse(IncenseResponseSchema, 'The Raising of Incense service'),
			400: jsonResponse(ErrorSchema, 'Invalid date'),
			500: jsonResponse(ErrorSchema, 'Internal server error'),
		},
	})

const commemorationsOf = (query: string | undefined) =>
	(query ?? '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean)

for (const serviceType of ['evening', 'morning'] as const) {
	app.openapi(incenseRoute(serviceType), (c) => {
		const { lang = 'en', commemorations } = c.req.valid('query')
		const service = getIncenseForDate(
			c.var.date,
			serviceType,
			lang,
			commemorationsOf(commemorations),
		)
		return c.json(service, 200)
	})
}

// Catalog of selectable commemorations (the saints/occasions with verses) — populates the picker.
const getCommemorationsRoute = createRoute({
	method: 'get',
	path: '/commemorations',
	tags: ['Incense'],
	summary: 'List selectable commemorations',
	description:
		'Returns the commemoration keys that have conditional verses, e.g. for a church-patron picker.',
	responses: {
		200: jsonResponse(
			z.object({ commemorations: z.array(z.string()) }),
			'Available commemoration keys',
		),
	},
})

app.openapi(getCommemorationsRoute, (c) =>
	c.json({ commemorations: getAvailableCommemorations('evening') }, 200),
)

export default app
