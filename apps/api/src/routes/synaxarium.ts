import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ErrorSchema, SynaxariumEntrySchema, SynaxariumSearchResultSchema } from '../schemas'
import * as synaxariumService from '../services/synaxarium.service'

const app = new OpenAPIHono()

// GET /api/synaxarium/:date
const getForDateRoute = createRoute({
	method: 'get',
	path: '/:date?',
	tags: ['Synaxarium'],
	summary: 'Get Synaxarium entries for a specific date',
	description:
		'Returns all saint commemorations and church events for a specific date. Defaults to today if no date provided.',
	request: {
		params: z.object({
			date: z.string().optional().openapi({ example: '2025-01-15' }),
		}),
		query: z.object({
			detailed: z.string().optional().openapi({ example: 'true' }),
		}),
	},
	responses: {
		200: {
			description: 'Synaxarium entries for the date',
			content: {
				'application/json': {
					schema: z.array(SynaxariumEntrySchema),
				},
			},
		},
		400: {
			description: 'Invalid date format',
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
		},
		404: {
			description: 'No synaxarium found for date',
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
		},
	},
})

app.openapi(getForDateRoute, (c) => {
	const { date } = c.req.valid('param')
	const { detailed } = c.req.valid('query')

	const parsedDate = date ? new Date(date) : new Date()
	if (Number.isNaN(parsedDate.getTime())) {
		return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
	}

	const synaxarium = synaxariumService.getSynaxariumForDate(parsedDate, detailed === 'true')

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
		}),
	},
	responses: {
		200: {
			description: 'Synaxarium entries for the Coptic date',
			content: {
				'application/json': {
					schema: z.array(SynaxariumEntrySchema),
				},
			},
		},
		404: {
			description: 'No synaxarium found for Coptic date',
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
		},
	},
})

app.openapi(getForCopticDateRoute, (c) => {
	const { copticDate } = c.req.valid('param')
	const { detailed } = c.req.valid('query')

	// Decode URL-encoded Coptic date (e.g., "7%20Hator" -> "7 Hator")
	const decodedDate = decodeURIComponent(copticDate).replace(/-/g, ' ')

	const synaxarium = synaxariumService.getSynaxariumByCopticDate(decodedDate, detailed === 'true')

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
		200: {
			description: 'Search results',
			content: {
				'application/json': {
					schema: z.array(SynaxariumSearchResultSchema),
				},
			},
		},
		400: {
			description: 'Missing search query',
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
		},
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
