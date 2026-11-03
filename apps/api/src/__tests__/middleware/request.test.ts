import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import { bibleTranslation, requestDate } from '../../middleware/request'
import { INVALID_DATE_MESSAGE } from '../../utils/dateUtils'
import { WALL_CLOCK_CACHE_CONTROL } from '../../utils/request'

const app = new Hono()
	.get('/param/:date?', requestDate(), (c) => c.json({ date: c.var.date.toDateString() }))
	.get('/query', requestDate('query'), (c) => c.json({ date: c.var.date.toDateString() }))
	.get('/lang', bibleTranslation, (c) => c.json({ translation: c.var.translation }))

describe('requestDate', () => {
	it.each([
		['a path parameter', '/param/2026-01-07'],
		['a query value', '/query?date=2026-01-07'],
	])('reads %s as a local date', async (_, path) => {
		const res = await app.request(path)
		expect(res.status).toBe(200)
		expect(await res.json()).toEqual({ date: new Date(2026, 0, 7).toDateString() })
		expect(res.headers.get('Cache-Control')).toBeNull()
	})

	it.each(['/param', '/query'])('defaults %s to today with a short cache', async (path) => {
		const res = await app.request(path)
		expect(res.status).toBe(200)
		expect(await res.json()).toEqual({ date: new Date().toDateString() })
		expect(res.headers.get('Cache-Control')).toBe(WALL_CLOCK_CACHE_CONTROL)
	})

	it.each(['/param/2026-02-30', '/param/today', '/query?date=2026-13-01'])(
		'answers %s with 400 before the handler runs',
		async (path) => {
			const res = await app.request(path)
			expect(res.status).toBe(400)
			expect(await res.json()).toEqual({ error: INVALID_DATE_MESSAGE })
		},
	)
})

describe('bibleTranslation', () => {
	it.each([
		['ar', 'ar'],
		['cop', 'cop'],
		['fr', 'en'],
	])('resolves lang=%s to %s', async (lang, translation) => {
		const res = await app.request(`/lang?lang=${lang}`)
		expect(await res.json()).toEqual({ translation })
	})

	it('defaults to English', async () => {
		const res = await app.request('/lang')
		expect(await res.json()).toEqual({ translation: 'en' })
	})
})
