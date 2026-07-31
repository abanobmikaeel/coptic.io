import { createRoute, z } from '@hono/zod-openapi'
import { warmTranslation } from '../models/readings'
import { ErrorSchema, LiturgyResponseSchema } from '../schemas'
import { getLiturgyForDate } from '../services/liturgy.service'
import { INVALID_DATE_MESSAGE, parseLocalDate } from '../utils/dateUtils'
import { INTERNAL_ERROR_MESSAGE } from '../utils/http'
import { createApiApp } from '../utils/openapi'

const app = createApiApp()

const getBasilRoute = createRoute({
	method: 'get',
	path: '/basil',
	tags: ['Liturgy'],
	summary: 'The Divine Liturgy of St. Basil',
	description:
		"Returns the Liturgy of St. Basil in prayed order, with the psalm, the Pauline, Catholic and Praxis epistles and the gospel resolved from the day's Katameros. Defaults to today.",
	request: {
		query: z.object({
			date: z.string().optional().openapi({ example: '2026-06-01' }),
			lang: z.enum(['en', 'ar', 'cop']).optional().openapi({ example: 'en' }),
		}),
	},
	responses: {
		200: {
			description: "The Liturgy with the day's readings resolved",
			content: { 'application/json': { schema: LiturgyResponseSchema } },
		},
		400: {
			description: 'Invalid date, or no readings available for it',
			content: { 'application/json': { schema: ErrorSchema } },
		},
		500: {
			description: 'Internal server error',
			content: { 'application/json': { schema: ErrorSchema } },
		},
	},
})

app.openapi(getBasilRoute, async (c) => {
	const { date: dateParam, lang } = c.req.valid('query')
	const translation = lang ?? 'en'

	await warmTranslation(translation)

	let date = new Date()
	if (dateParam) {
		const parsed = parseLocalDate(dateParam)
		if (!parsed) {
			return c.json({ error: INVALID_DATE_MESSAGE }, 400)
		}
		date = parsed
	} else {
		// Wall-clock dependent; don't let the 12h edge cache serve a stale "today".
		c.header('Cache-Control', 'public, max-age=120, s-maxage=120')
	}

	try {
		return c.json(getLiturgyForDate(date, 'basil', translation), 200)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		// Known data-not-found errors are client-facing 400s; everything else is ours.
		if (/(not found|no reading|no synaxarium|month not found)/i.test(message)) {
			return c.json({ error: 'No readings available for this date' }, 400)
		}
		console.error('Error in liturgy:', error)
		return c.json({ error: INTERNAL_ERROR_MESSAGE }, 500)
	}
})

export default app
