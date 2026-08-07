import { createRoute, z } from '@hono/zod-openapi'
import type { Context } from 'hono'
import { warmTranslation } from '../models/readings'
import { ErrorSchema, IncenseResponseSchema } from '../schemas'
import { getAvailableCommemorations, getIncenseForDate } from '../services/incense.service'
import { INVALID_DATE_MESSAGE, parseLocalDate } from '../utils/dateUtils'
import { INTERNAL_ERROR_MESSAGE } from '../utils/http'
import { createApiApp } from '../utils/openapi'

const app = createApiApp()

// Matins and Vespers are the same rite with different slots, so they share one route
// definition; only the path, the wording and the reading slots differ.
const incenseRoute = (serviceType: 'evening' | 'morning', summary: string, description: string) =>
	createRoute({
		method: 'get',
		path: `/${serviceType}`,
		tags: ['Incense'],
		summary,
		description,
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
			500: {
				description: 'Internal server error',
				content: {
					'application/json': {
						schema: ErrorSchema,
					},
				},
			},
		},
	})

const getEveningRoute = incenseRoute(
	'evening',
	'Get the Evening Raising of Incense',
	'Returns the full Evening Raising of Incense (Vespers) for a given date, with psalm verses and the daily gospel resolved from the readings system.',
)

const getMorningRoute = incenseRoute(
	'morning',
	'Get the Morning Raising of Incense',
	"Returns the full Morning Raising of Incense (Matins) for a given date. The rite is shared with Vespers; Matins prays the litanies of the sick, travellers and oblations, sings its own gospel response, and reads the day's Matins psalm and gospel.",
)

// One body for both services; only the reading slots and the proper litanies differ,
// and the data layer already encodes that.
async function respond(
	c: Context,
	serviceType: 'evening' | 'morning',
	query: { date?: string; lang?: 'en' | 'ar' | 'cop'; commemorations?: string },
) {
	const translation = query.lang ?? 'en'
	await warmTranslation(translation)

	let date = new Date()
	if (query.date) {
		const parsed = parseLocalDate(query.date)
		if (!parsed) return c.json({ error: INVALID_DATE_MESSAGE }, 400)
		date = parsed
	} else {
		// Wall-clock dependent; don't let the 12h edge cache serve a stale "today".
		c.header('Cache-Control', 'public, max-age=120, s-maxage=120')
	}

	const selected = (query.commemorations ?? '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean)

	try {
		return c.json(getIncenseForDate(date, serviceType, translation, selected), 200)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		// Known data-not-found errors are client-facing 400s; everything else is ours.
		if (/(not found|no reading|no synaxarium|month not found)/i.test(message)) {
			return c.json({ error: 'No readings available for this date' }, 400)
		}
		console.error(`Error in incense (${serviceType}):`, error)
		return c.json({ error: INTERNAL_ERROR_MESSAGE }, 500)
	}
}

app.openapi(getEveningRoute, (c) => respond(c, 'evening', c.req.valid('query')))
app.openapi(getMorningRoute, (c) => respond(c, 'morning', c.req.valid('query')))

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
