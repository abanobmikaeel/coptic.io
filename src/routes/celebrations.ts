import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import * as celebrationsService from '../services/celebrations.service'
import { CelebrationSchema, UpcomingCelebrationSchema, ErrorSchema } from '../schemas'
import { parseDateString } from '../utils/parseDateString'

const app = new OpenAPIHono()

// GET /api/celebrations
const getAllRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Celebrations'],
	summary: 'Get all celebrations',
	description: 'Returns all feasts, fasts, and celebrations in the Coptic calendar',
	responses: {
		200: {
			description: 'List of all celebrations',
			content: {
				'application/json': {
					schema: z.array(CelebrationSchema),
				},
			},
		},
	},
})

app.openapi(getAllRoute, (c) => {
	const celebrations = celebrationsService.getAllCelebrations()
	return c.json(celebrations, 200)
})

// GET /api/celebrations/:date
const getForDateRoute = createRoute({
	method: 'get',
	path: '/:date?',
	tags: ['Celebrations'],
	summary: 'Get celebrations for a specific date',
	description:
		'Returns all celebrations occurring on a specific Gregorian date. Defaults to today if no date provided.',
	request: {
		params: z.object({
			date: z.string().optional().openapi({ example: '2025-01-07' }),
		}),
	},
	responses: {
		200: {
			description: 'Celebrations for the date',
			content: {
				'application/json': {
					schema: z.array(CelebrationSchema).nullable(),
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
	},
})

app.openapi(getForDateRoute, (c) => {
	const { date } = c.req.valid('param')

	let parsedDate: Date
	if (date) {
		const parsed = parseDateString(date)
		if (!parsed) {
			return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
		}
		parsedDate = parsed
	} else {
		parsedDate = new Date()
	}

	const celebrations = celebrationsService.getCelebrationsForDate(parsedDate)
	return c.json(celebrations, 200)
})

// GET /api/celebrations/upcoming/list
const getUpcomingRoute = createRoute({
	method: 'get',
	path: '/upcoming/list',
	tags: ['Celebrations'],
	summary: 'Get upcoming celebrations',
	description: 'Returns celebrations occurring in the next N days',
	request: {
		query: z.object({
			days: z.string().optional().openapi({ example: '30' }),
		}),
	},
	responses: {
		200: {
			description: 'Upcoming celebrations',
			content: {
				'application/json': {
					schema: z.array(UpcomingCelebrationSchema),
				},
			},
		},
	},
})

app.openapi(getUpcomingRoute, (c) => {
	const { days } = c.req.valid('query')
	const daysNum = parseInt(days || '30')
	const upcoming = celebrationsService.getUpcomingCelebrations(daysNum)
	return c.json(upcoming, 200)
})

export default app
