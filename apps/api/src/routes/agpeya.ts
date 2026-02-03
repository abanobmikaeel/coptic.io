import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { AgpeyaAnyHourSchema, AgpeyaWatchSchema, ErrorSchema } from '../schemas'
import * as agpeyaService from '../services/agpeya.service'

const app = new OpenAPIHono()

const validHours = ['prime', 'terce', 'sext', 'none', 'vespers', 'compline', 'midnight'] as const
const validWatches = ['1', '2', '3'] as const

// GET /api/agpeya - Get current hour
const getCurrentRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Agpeya'],
	summary: 'Get current Agpeya hour based on time of day',
	description: 'Returns the Agpeya prayer hour appropriate for the current time of day.',
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

app.openapi(getCurrentRoute, (c) => {
	const currentHourId = agpeyaService.getCurrentHour()
	const hour = agpeyaService.getAgpeyaHour(currentHourId)
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

app.openapi(listHoursRoute, (c) => {
	const hours = agpeyaService.getAllHours()
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

app.openapi(getMidnightWatchRoute, (c) => {
	const { watch: watchId } = c.req.valid('param')

	const watch = agpeyaService.getMidnightWatch(watchId as agpeyaService.MidnightWatchId)

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

app.openapi(getHourRoute, (c) => {
	const { hour: hourId } = c.req.valid('param')

	const hour = agpeyaService.getAgpeyaHour(hourId)

	if (!hour) {
		return c.json({ error: `Hour '${hourId}' not found` }, 404)
	}

	return c.json(hour, 200)
})

export default app
