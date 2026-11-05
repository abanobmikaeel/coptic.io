import { createRoute, z } from '@hono/zod-openapi'
import { ErrorSchema, SearchResponseSchema } from '../schemas'
import { searchService } from '../services/search'
import { createApiApp, jsonResponse } from '../utils/openapi'

const app = createApiApp()

// GET /api/search
const searchRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Search'],
	summary: 'Unified search across all content',
	description:
		'Search Bible, Synaxarium, and Agpeya content. Supports Bible references (e.g., "John 3:16"), saint names, and prayer hour names.',
	request: {
		query: z.object({
			q: z.string().min(1).openapi({
				example: 'John 3:16',
				description: 'Search query',
			}),
			limit: z.string().optional().openapi({
				example: '5',
				description: 'Maximum results per category (default: 5)',
			}),
			categories: z.string().optional().openapi({
				example: 'bible,synaxarium,agpeya',
				description: 'Comma-separated list of categories to search (default: all)',
			}),
		}),
	},
	responses: {
		200: jsonResponse(SearchResponseSchema, 'Search results grouped by content type'),
		400: jsonResponse(ErrorSchema, 'Invalid request'),
	},
})

// Initialize the search service on first request, deduplicated across concurrent
// ones. A failure clears the cached promise: initialization fetches the Bible from
// R2, so a transient error must not leave the isolate unable to search until it is
// recycled.
let initPromise: Promise<void> | null = null

const ensureInitialized = (): Promise<void> => {
	initPromise ??= searchService.initialize().catch((error) => {
		initPromise = null
		throw error
	})
	return initPromise
}

app.openapi(searchRoute, async (c) => {
	await ensureInitialized()

	const { q, limit, categories } = c.req.valid('query')

	if (!q || q.trim().length === 0) {
		return c.json({ error: 'Search query is required' }, 400)
	}

	const parsedLimit = limit ? parseInt(limit, 10) : 5
	if (Number.isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
		return c.json({ error: 'Limit must be between 1 and 50' }, 400)
	}

	const parsedCategories = categories
		? (categories
				.split(',')
				.filter((c) => ['bible', 'synaxarium', 'agpeya'].includes(c.trim())) as (
				| 'bible'
				| 'synaxarium'
				| 'agpeya'
			)[])
		: undefined

	const results = await searchService.search({
		query: q,
		limit: parsedLimit,
		categories: parsedCategories,
	})

	return c.json(results, 200)
})

export default app
