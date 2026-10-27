import { createRoute, z } from '@hono/zod-openapi'
import { requestDate } from '../middleware/request'
import { CelebrationSchema, ErrorSchema, UpcomingCelebrationSchema } from '../schemas'
import * as celebrationsService from '../services/celebrations.service'
import { createApiApp, jsonResponse } from '../utils/openapi'
import { WALL_CLOCK_CACHE_CONTROL } from '../utils/request'

const app = createApiApp()

// GET /api/celebrations
const getAllRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Celebrations'],
	summary: 'Get all celebrations',
	description: 'Returns all feasts, fasts, and celebrations in the Coptic calendar',
	responses: {
		200: jsonResponse(z.array(CelebrationSchema), 'List of all celebrations'),
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
	middleware: [requestDate()] as const,
	request: {
		params: z.object({
			date: z.string().optional().openapi({ example: '2025-01-07' }),
		}),
		query: z.object({
			lang: z.enum(['en', 'ar', 'es']).optional().openapi({ example: 'ar' }),
		}),
	},
	responses: {
		200: jsonResponse(z.array(CelebrationSchema).nullable(), 'Celebrations for the date'),
		400: jsonResponse(ErrorSchema, 'Invalid date format'),
	},
})

app.openapi(getForDateRoute, (c) => {
	const { lang } = c.req.valid('query')
	return c.json(celebrationsService.getCelebrationsForDate(c.var.date, lang), 200)
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
			days: z.coerce.number().min(1).max(365).optional().openapi({ example: 30 }),
			lang: z.enum(['en', 'ar', 'es']).optional().openapi({ example: 'ar' }),
		}),
	},
	responses: {
		200: jsonResponse(z.array(UpcomingCelebrationSchema), 'Upcoming celebrations'),
	},
})

app.openapi(getUpcomingRoute, (c) => {
	const { days, lang } = c.req.valid('query')
	// This response is always relative to "today", so it must not be cached for 12h.
	c.header('Cache-Control', WALL_CLOCK_CACHE_CONTROL)
	return c.json(celebrationsService.getUpcomingCelebrations(days, lang), 200)
})

export default app
