import { getLiturgicalName } from '@coptic/core'
import { createRoute, z } from '@hono/zod-openapi'
import { CelebrationSchema, ErrorSchema, UpcomingCelebrationSchema } from '../schemas'
import * as celebrationsService from '../services/celebrations.service'
import { INVALID_DATE_MESSAGE, parseLocalDate } from '../utils/dateUtils'
import { createApiApp } from '../utils/openapi'

const app = createApiApp()

// Localize a celebration's name for the requested language (falls back to English).
const localizeName = <T extends { name: string }>(c: T, lang: string): T => ({
	...c,
	name: getLiturgicalName(c.name, lang),
})

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
		query: z.object({
			lang: z.enum(['en', 'ar', 'es']).optional().openapi({ example: 'ar' }),
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
	const { lang } = c.req.valid('query')

	let parsedDate = new Date()
	if (date) {
		const parsed = parseLocalDate(date)
		if (!parsed) {
			return c.json({ error: INVALID_DATE_MESSAGE }, 400)
		}
		parsedDate = parsed
	} else {
		c.header('Cache-Control', 'public, max-age=120, s-maxage=120')
	}

	const celebrations = celebrationsService.getCelebrationsForDate(parsedDate)
	const localized = celebrations?.map((cel) => localizeName(cel, lang ?? 'en')) ?? celebrations
	return c.json(localized, 200)
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
	const { days, lang } = c.req.valid('query')
	// This response is always relative to "today", so it must not be cached for 12h.
	c.header('Cache-Control', 'public, max-age=120, s-maxage=120')
	const upcoming = celebrationsService.getUpcomingCelebrations(days ?? 30)
	const localized = upcoming.map((day) => ({
		...day,
		celebrations: day.celebrations.map((cel) => localizeName(cel, lang ?? 'en')),
	}))
	return c.json(localized, 200)
})

export default app
