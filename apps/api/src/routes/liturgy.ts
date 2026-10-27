import { createRoute, z } from '@hono/zod-openapi'
import { bibleTranslation, requestDate } from '../middleware/request'
import { ErrorSchema, LiturgyResponseSchema } from '../schemas'
import { getLiturgyForDate } from '../services/liturgy.service'
import { createApiApp, jsonResponse } from '../utils/openapi'

const app = createApiApp()

const getBasilRoute = createRoute({
	method: 'get',
	path: '/basil',
	tags: ['Liturgy'],
	summary: 'The Divine Liturgy of St. Basil',
	description:
		"Returns the Liturgy of St. Basil in prayed order, with the psalm, the Pauline, Catholic and Praxis epistles and the gospel resolved from the day's Katameros. Defaults to today.",
	middleware: [requestDate('query'), bibleTranslation] as const,
	request: {
		query: z.object({
			date: z.string().optional().openapi({ example: '2026-06-01' }),
			lang: z.enum(['en', 'ar', 'cop']).optional().openapi({ example: 'en' }),
		}),
	},
	responses: {
		200: jsonResponse(LiturgyResponseSchema, "The Liturgy with the day's readings resolved"),
		400: jsonResponse(ErrorSchema, 'Invalid date'),
		500: jsonResponse(ErrorSchema, 'Internal server error'),
	},
})

app.openapi(getBasilRoute, (c) => {
	const { lang = 'en' } = c.req.valid('query')
	return c.json(getLiturgyForDate(c.var.date, 'basil', lang), 200)
})

export default app
