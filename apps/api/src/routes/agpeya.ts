import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { warmTranslation } from '../models/readings'
import { AgpeyaAnyHourSchema, AgpeyaWatchSchema, ErrorSchema } from '../schemas'
import * as agpeyaService from '../services/agpeya.service'
import type { BibleTranslation } from '../types'

const app = new OpenAPIHono()

const validHours = ['prime', 'terce', 'sext', 'none', 'vespers', 'compline', 'midnight'] as const
const validWatches = ['1', '2', '3'] as const
const langQuery = z.object({
	lang: z.enum(['en', 'ar', 'es', 'cop']).optional().openapi({ example: 'ar' }),
})

const toTranslation = (lang?: string): BibleTranslation =>
	lang === 'ar' ? 'ar' : lang === 'es' ? 'es' : lang === 'cop' ? 'cop' : 'en'

// GET /api/agpeya - Get current hour
const getCurrentRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Agpeya'],
	summary: 'Get current Agpeya hour based on time of day',
	description: 'Returns the Agpeya prayer hour appropriate for the current time of day.',
	request: { query: langQuery },
	responses: {
		200: {
			description: 'Current Agpeya hour',
			content: {
				'application/json': {
					schema: AgpeyaAnyHourSchema,
				},
			},
		},
	},
})

app.openapi(getCurrentRoute, async (c) => {
	const translation = toTranslation(c.req.valid('query').lang)
	await warmTranslation(translation)
	const currentHourId = agpeyaService.getCurrentHour()
	const hour = agpeyaService.getAgpeyaHour(currentHourId, translation)
	// Current hour always exists since getCurrentHour returns a valid hour ID
	return c.json(hour!, 200)
})

// GET /api/agpeya/hours - List all hours
const listHoursRoute = createRoute({
	method: 'get',
	path: '/hours',
	tags: ['Agpeya'],
	summary: 'List all Agpeya prayer hours',
	description: 'Returns a list of all seven canonical prayer hours.',
	request: { query: langQuery },
	responses: {
		200: {
			description: 'List of all Agpeya hours',
			content: {
				'application/json': {
					schema: z.array(AgpeyaAnyHourSchema),
				},
			},
		},
	},
})

app.openapi(listHoursRoute, async (c) => {
	const translation = toTranslation(c.req.valid('query').lang)
	await warmTranslation(translation)
	const hours = agpeyaService.getAllHours(translation)
	return c.json(hours, 200)
})

// GET /api/agpeya/midnight/watch/:watch - Get a specific midnight watch
const getMidnightWatchRoute = createRoute({
	method: 'get',
	path: '/midnight/watch/:watch',
	tags: ['Agpeya'],
	summary: 'Get a specific midnight watch',
	description: 'Returns the prayers for a specific watch of the midnight office (1, 2, or 3).',
	request: {
		params: z.object({
			watch: z.enum(validWatches).openapi({
				example: '1',
				description: 'The watch number (1, 2, or 3)',
			}),
		}),
		query: langQuery,
	},
	responses: {
		200: {
			description: 'Midnight watch data',
			content: {
				'application/json': {
					schema: AgpeyaWatchSchema,
				},
			},
		},
		404: {
			description: 'Watch not found',
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
		},
	},
})

app.openapi(getMidnightWatchRoute, async (c) => {
	const translation = toTranslation(c.req.valid('query').lang)
	await warmTranslation(translation)
	const { watch: watchId } = c.req.valid('param')

	const watch = agpeyaService.getMidnightWatch(
		watchId as agpeyaService.MidnightWatchId,
		translation,
	)

	if (!watch) {
		return c.json({ error: `Watch '${watchId}' not found` }, 404)
	}

	return c.json(watch, 200)
})

// GET /api/agpeya/:hour - Get specific hour
const getHourRoute = createRoute({
	method: 'get',
	path: '/:hour',
	tags: ['Agpeya'],
	summary: 'Get a specific Agpeya prayer hour',
	description:
		'Returns the prayers for a specific canonical hour. For midnight, returns all three watches.',
	request: {
		params: z.object({
			hour: z.enum(validHours).openapi({
				example: 'prime',
				description: 'The canonical hour to retrieve',
			}),
		}),
		query: langQuery,
	},
	responses: {
		200: {
			description: 'Agpeya hour data',
			content: {
				'application/json': {
					schema: AgpeyaAnyHourSchema,
				},
			},
		},
		404: {
			description: 'Hour not found',
			content: {
				'application/json': {
					schema: ErrorSchema,
				},
			},
		},
	},
})

app.openapi(getHourRoute, async (c) => {
	const translation = toTranslation(c.req.valid('query').lang)
	await warmTranslation(translation)
	const { hour: hourId } = c.req.valid('param')

	const hour = agpeyaService.getAgpeyaHour(hourId, translation)

	if (!hour) {
		return c.json({ error: `Hour '${hourId}' not found` }, 404)
	}

	return c.json(hour, 200)
})

export default app
