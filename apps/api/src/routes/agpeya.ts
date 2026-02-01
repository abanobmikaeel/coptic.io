import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { AgpeyaHourSchema, ErrorSchema } from '../schemas'
import * as agpeyaService from '../services/agpeya.service'

const app = new OpenAPIHono()

const validHours = ['prime', 'terce', 'sext', 'none', 'vespers', 'compline', 'midnight'] as const

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
					schema: AgpeyaHourSchema,
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
					schema: z.array(AgpeyaHourSchema),
				},
			},
		},
	},
})

app.openapi(listHoursRoute, (c) => {
	const hours = agpeyaService.getAllHours()
	return c.json(hours, 200)
})

// GET /api/agpeya/:hour - Get specific hour
const getHourRoute = createRoute({
	method: 'get',
	path: '/:hour',
	tags: ['Agpeya'],
	summary: 'Get a specific Agpeya prayer hour',
	description: 'Returns the prayers for a specific canonical hour.',
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
					schema: AgpeyaHourSchema,
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
