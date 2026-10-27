import { createMiddleware } from 'hono/factory'
import { warmTranslation } from '../models/readings'
import type { BibleTranslation } from '../types'
import { INVALID_DATE_MESSAGE, parseLocalDate } from '../utils/dateUtils'
import { WALL_CLOCK_CACHE_CONTROL, parseTranslation } from '../utils/request'

/**
 * Resolve the request's `date` (a path parameter or a query value, YYYY-MM-DD) to a
 * local date in `c.var.date`. An absent date means today, which also caps the cache
 * lifetime; a malformed one is answered 400 before the handler runs.
 */
export const requestDate = (from: 'param' | 'query' = 'param') =>
	createMiddleware<{ Variables: { date: Date } }>(async (c, next) => {
		const input = from === 'param' ? c.req.param('date') : c.req.query('date')
		if (!input) {
			c.header('Cache-Control', WALL_CLOCK_CACHE_CONTROL)
			c.set('date', new Date())
			return next()
		}
		const date = parseLocalDate(input)
		if (!date) return c.json({ error: INVALID_DATE_MESSAGE }, 400)
		c.set('date', date)
		return next()
	})

/**
 * Resolve `?lang=` to a Bible translation in `c.var.translation` and load its text.
 * In Workers the Bible is lazy-loaded from R2 on first use per isolate, so routes that
 * print scripture must warm it before the handler reads it.
 */
export const bibleTranslation = createMiddleware<{
	Variables: { translation: BibleTranslation }
}>(async (c, next) => {
	const translation = parseTranslation(c.req.query('lang'))
	await warmTranslation(translation)
	c.set('translation', translation)
	return next()
})
