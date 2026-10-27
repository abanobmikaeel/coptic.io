import { createRoute, z } from '@hono/zod-openapi'
import { requestDate } from '../middleware/request'
import { ErrorSchema, ReadingsResponseSchema } from '../schemas'
import { getReadingsForDate } from '../services/readings.service'
import { createApiApp, jsonResponse } from '../utils/openapi'
import { parseTranslation } from '../utils/request'

const app = createApiApp()

// GET /api/readings/:date
const getForDateRoute = createRoute({
	method: 'get',
	path: '/:date?',
	tags: ['Readings'],
	summary: "Get the day's Katameros readings",
	description:
		"Returns the readings the Church reads on a Gregorian date, from whichever lectionary cycle governs it (the annual date, a Sunday, Jonah's Fast, Great Lent or the Holy Fifty), with the Synaxarium and the day's celebrations. Defaults to today.",
	middleware: [requestDate()] as const,
	request: {
		params: z.object({
			date: z.string().optional().openapi({ example: '2026-11-01' }),
		}),
		query: z.object({
			detailed: z.string().optional().openapi({
				example: 'true',
				description: '"true" resolves each slot to its verse text instead of a reference',
			}),
			lang: z.string().optional().openapi({
				example: 'ar',
				description: 'en, ar, es or cop; anything else reads English',
			}),
		}),
	},
	responses: {
		200: jsonResponse(ReadingsResponseSchema, "The day's readings"),
		400: jsonResponse(ErrorSchema, 'Invalid date'),
	},
})

app.openapi(getForDateRoute, async (c) => {
	const { detailed, lang } = c.req.valid('query')
	return c.json(
		await getReadingsForDate(c.var.date, detailed === 'true', parseTranslation(lang)),
		200,
	)
})

export default app
