import { createRoute, z } from '@hono/zod-openapi'
import { requestDate } from '../middleware/request'
import { ErrorSchema, SynaxariumEntrySchema, SynaxariumSearchResultSchema } from '../schemas'
import * as synaxariumService from '../services/synaxarium.service'
import { createApiApp, jsonResponse } from '../utils/openapi'

const app = createApiApp()

// GET /api/synaxarium/:date
const getForDateRoute = createRoute({
	method: 'get',
	path: '/:date?',
	tags: ['Synaxarium'],
	summary: 'Get Synaxarium entries for a specific date',
	description:
		'Returns all saint commemorations and church events for a specific date. Defaults to today if no date provided.',
	middleware: [requestDate()] as const,
	request: {
		params: z.object({
			date: z.string().optional().openapi({ example: '2025-01-15' }),
		}),
		query: z.object({
			detailed: z.string().optional().openapi({ example: 'true' }),
			lang: z.enum(['en', 'ar']).optional().openapi({ example: 'en' }),
		}),
	},
	responses: {
		200: jsonResponse(z.array(SynaxariumEntrySchema), 'Synaxarium entries for the date'),
		400: jsonResponse(ErrorSchema, 'Invalid date format'),
		404: jsonResponse(ErrorSchema, 'No synaxarium found for date'),
	},
})

app.openapi(getForDateRoute, (c) => {
	const { detailed, lang } = c.req.valid('query')
	const synaxarium = synaxariumService.getSynaxariumForDate(c.var.date, detailed === 'true', lang)

	if (!synaxarium) {
		return c.json({ error: 'No synaxarium found for this date' }, 404)
	}

	return c.json(synaxarium, 200)
})

// GET /api/synaxarium/coptic/:copticDate
const getForCopticDateRoute = createRoute({
	method: 'get',
	path: '/coptic/:copticDate',
	tags: ['Synaxarium'],
	summary: 'Get Synaxarium entries for a Coptic date',
	description: 'Returns all saint commemorations for a specific Coptic date (e.g., "7 Hator")',
	request: {
		params: z.object({
			copticDate: z.string().openapi({ example: '7 Hator' }),
		}),
		query: z.object({
			detailed: z.string().optional().openapi({ example: 'true' }),
			lang: z.enum(['en', 'ar']).optional().openapi({ example: 'en' }),
		}),
	},
	responses: {
		200: jsonResponse(z.array(SynaxariumEntrySchema), 'Synaxarium entries for the Coptic date'),
		404: jsonResponse(ErrorSchema, 'No synaxarium found for Coptic date'),
	},
})

app.openapi(getForCopticDateRoute, (c) => {
	const { copticDate } = c.req.valid('param')
	const { detailed, lang } = c.req.valid('query')

	// Decode URL-encoded Coptic date (e.g., "7%20Hator" -> "7 Hator")
	const decodedDate = decodeURIComponent(copticDate).replace(/-/g, ' ')

	const synaxarium = synaxariumService.getSynaxariumByCopticDate(
		decodedDate,
		detailed === 'true',
		lang,
	)

	if (!synaxarium) {
		return c.json({ error: 'No synaxarium found for this Coptic date' }, 404)
	}

	return c.json(synaxarium, 200)
})

// GET /api/synaxarium/search/query
const searchRoute = createRoute({
	method: 'get',
	path: '/search/query',
	tags: ['Synaxarium'],
	summary: 'Search Synaxarium entries',
	description: 'Search for saints and events by name',
	request: {
		query: z.object({
			q: z.string().openapi({ example: 'Mary' }),
		}),
	},
	responses: {
		200: jsonResponse(z.array(SynaxariumSearchResultSchema), 'Search results'),
		400: jsonResponse(ErrorSchema, 'Missing search query'),
	},
})

app.openapi(searchRoute, (c) => {
	const { q } = c.req.valid('query')

	if (!q || q.trim().length === 0) {
		return c.json({ error: 'Search query is required' }, 400)
	}

	const results = synaxariumService.searchSynaxarium(q)
	return c.json(results, 200)
})

export default app
