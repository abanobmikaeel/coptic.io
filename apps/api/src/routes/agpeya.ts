import { createRoute, z } from '@hono/zod-openapi'
import { bibleTranslation } from '../middleware/request'
import { AgpeyaAnyHourSchema, AgpeyaWatchSchema, ErrorSchema } from '../schemas'
import * as agpeyaService from '../services/agpeya.service'
import { createApiApp, jsonResponse } from '../utils/openapi'
import { WALL_CLOCK_CACHE_CONTROL } from '../utils/request'

const app = createApiApp()

const validHours = ['prime', 'terce', 'sext', 'none', 'vespers', 'compline', 'midnight'] as const
const validWatches = ['1', '2', '3'] as const
const langQuery = z.object({
	lang: z.enum(['en', 'ar', 'es', 'cop']).optional().openapi({ example: 'ar' }),
	psalms: z.enum(['septuagint', 'bible']).optional().openapi({
		example: 'septuagint',
		description:
			'Psalm text source: "septuagint" (default) serves the liturgical Septuagint psalter with traditional Agpeya verse divisions; "bible" resolves the same psalms from the Bible translation instead.',
	}),
})

const hourQuery = langQuery.extend({
	include: z.enum(['sections']).optional().openapi({
		example: 'sections',
		description:
			'"sections" adds `sections`: the whole hour in prayed order, each Midnight watch as a group of its sections. The named fields are always present.',
	}),
})

const toPsalmSource = (psalms?: string): agpeyaService.PsalmSource =>
	psalms === 'bible' ? 'bible' : 'septuagint'

// GET /api/agpeya - Get current hour
const getCurrentRoute = createRoute({
	method: 'get',
	path: '/',
	middleware: [bibleTranslation] as const,
	tags: ['Agpeya'],
	summary: 'Get current Agpeya hour based on time of day',
	description: 'Returns the Agpeya prayer hour appropriate for the current time of day.',
	request: { query: langQuery },
	responses: {
		200: jsonResponse(AgpeyaAnyHourSchema, 'Current Agpeya hour'),
	},
})

app.openapi(getCurrentRoute, (c) => {
	const query = c.req.valid('query')
	const { translation } = c.var
	const currentHourId = agpeyaService.getCurrentHour()
	const hour = agpeyaService.getAgpeyaHour(currentHourId, translation, toPsalmSource(query.psalms))
	// The "current" hour is wall-clock dependent, so it must not share the 12h
	// edge-cache TTL used by the deterministic hour routes. Cap it to 2 minutes:
	// cheap enough to keep origin load low, short enough that the hour transition
	// is picked up promptly.
	c.header('Cache-Control', WALL_CLOCK_CACHE_CONTROL)
	// Current hour always exists since getCurrentHour returns a valid hour ID
	return c.json(hour!, 200)
})

// GET /api/agpeya/hours - List all hours
const listHoursRoute = createRoute({
	method: 'get',
	path: '/hours',
	middleware: [bibleTranslation] as const,
	tags: ['Agpeya'],
	summary: 'List all Agpeya prayer hours',
	description: 'Returns a list of all seven canonical prayer hours.',
	request: { query: langQuery },
	responses: {
		200: jsonResponse(z.array(AgpeyaAnyHourSchema), 'List of all Agpeya hours'),
	},
})

app.openapi(listHoursRoute, (c) => {
	const query = c.req.valid('query')
	const { translation } = c.var
	const hours = agpeyaService.getAllHours(translation, toPsalmSource(query.psalms))
	return c.json(hours, 200)
})

// GET /api/agpeya/midnight/watch/:watch - Get a specific midnight watch
const getMidnightWatchRoute = createRoute({
	method: 'get',
	path: '/midnight/watch/:watch',
	middleware: [bibleTranslation] as const,
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
		200: jsonResponse(AgpeyaWatchSchema, 'Midnight watch data'),
		404: jsonResponse(ErrorSchema, 'Watch not found'),
	},
})

app.openapi(getMidnightWatchRoute, (c) => {
	const query = c.req.valid('query')
	const { translation } = c.var
	const { watch: watchId } = c.req.valid('param')

	const watch = agpeyaService.getMidnightWatch(
		watchId as agpeyaService.MidnightWatchId,
		translation,
		toPsalmSource(query.psalms),
	)

	if (!watch) {
		return c.json({ error: `Watch '${watchId}' not found` }, 404)
	}

	return c.json(watch, 200)
})

// GET /api/agpeya/translations - List content languages the Agpeya can render
const TranslationsSchema = z
	.object({
		available: z.array(z.enum(['en', 'ar', 'es', 'cop'])).openapi({ example: ['en', 'ar', 'cop'] }),
	})
	.openapi('AgpeyaTranslations')

const getTranslationsRoute = createRoute({
	method: 'get',
	path: '/translations',
	tags: ['Agpeya'],
	summary: 'List available Agpeya content languages',
	description:
		'Returns the content languages the Agpeya can render (prose languages plus scripture-only languages). Used to hide unavailable languages from the reader settings.',
	responses: {
		200: jsonResponse(TranslationsSchema, 'Available content languages'),
	},
})

app.openapi(getTranslationsRoute, (c) => {
	return c.json({ available: agpeyaService.getAvailableTranslations() }, 200)
})

// GET /api/agpeya/:hour - Get specific hour
const getHourRoute = createRoute({
	method: 'get',
	path: '/:hour',
	middleware: [bibleTranslation] as const,
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
		query: hourQuery,
	},
	responses: {
		200: jsonResponse(AgpeyaAnyHourSchema, 'Agpeya hour data'),
		404: jsonResponse(ErrorSchema, 'Hour not found'),
	},
})

app.openapi(getHourRoute, (c) => {
	const query = c.req.valid('query')
	const { translation } = c.var
	const { hour: hourId } = c.req.valid('param')

	const hour = agpeyaService.getAgpeyaHour(hourId, translation, toPsalmSource(query.psalms), {
		sections: query.include === 'sections',
	})

	if (!hour) {
		return c.json({ error: `Hour '${hourId}' not found` }, 404)
	}

	return c.json(hour, 200)
})

export default app
