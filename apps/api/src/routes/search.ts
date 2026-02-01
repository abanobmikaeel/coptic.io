import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ErrorSchema } from '../schemas'
import { searchService } from '../services/search'

const app = new OpenAPIHono()

// Schema for individual result types
const BibleSearchResultSchema = z.object({
	type: z.enum(['verse', 'reference']),
	book: z.string(),
	chapter: z.number(),
	verse: z.number().optional(),
	text: z.string(),
	url: z.string(),
	score: z.number().optional(),
})

const SynaxariumSearchResultSchema = z.object({
	type: z.enum(['saint', 'feast']),
	name: z.string(),
	date: z.string(),
	copticDate: z.string(),
	summary: z.string().optional(),
	url: z.string(),
	score: z.number().optional(),
})

const AgpeyaSearchResultSchema = z.object({
	type: z.enum(['hour', 'prayer']),
	id: z.string(),
	name: z.string(),
	englishName: z.string(),
	traditionalTime: z.string().optional(),
	url: z.string(),
	score: z.number().optional(),
})

const SearchResponseSchema = z.object({
	results: z.object({
		bible: z.array(BibleSearchResultSchema),
		synaxarium: z.array(SynaxariumSearchResultSchema),
		agpeya: z.array(AgpeyaSearchResultSchema),
	}),
	query: z.string(),
	totalCount: z.number(),
})

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
		200: {
			description: 'Search results grouped by content type',
			content: {
				'application/json': {
					schema: SearchResponseSchema,
				},
			},
		},
		400: {
			description: 'Invalid request',
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
		},
	},
})

// Initialize search service on first request
let initialized = false

app.openapi(searchRoute, async (c) => {
	// Lazy initialization
	if (!initialized) {
		await searchService.initialize()
		initialized = true
	}

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
