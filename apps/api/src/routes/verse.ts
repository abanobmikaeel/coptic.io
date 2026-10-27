import { createRoute, z } from '@hono/zod-openapi'
import { requestDate } from '../middleware/request'
import { DailyVerseSchema, ErrorSchema } from '../schemas'
import { getDailyVerse } from '../services/daily-verse.service'
import { createApiApp, jsonResponse } from '../utils/openapi'
import { parseTranslation } from '../utils/request'

const app = createApiApp()

// GET /api/verse/:date
const getForDateRoute = createRoute({
	method: 'get',
	path: '/:date?',
	tags: ['Readings'],
	summary: 'Get the verse of the day',
	description:
		"Returns one featured verse from the day's readings. A translation without the verse falls back to English, flagged by `fallback`. Defaults to today.",
	middleware: [requestDate()] as const,
	request: {
		params: z.object({
			date: z.string().optional().openapi({ example: '2026-05-20' }),
		}),
		query: z.object({
			lang: z.string().optional().openapi({
				example: 'ar',
				description: 'en, ar, es or cop; anything else reads English',
			}),
		}),
	},
	responses: {
		200: jsonResponse(DailyVerseSchema, 'The verse of the day'),
		400: jsonResponse(ErrorSchema, 'Invalid date'),
		404: jsonResponse(ErrorSchema, 'No verse for the date'),
	},
})

app.openapi(getForDateRoute, async (c) => {
	const result = await getDailyVerse(c.var.date, parseTranslation(c.req.valid('query').lang))
	if (!result) return c.json({ error: 'No verse for date' }, 404)
	return c.json(result, 200)
})

export default app
