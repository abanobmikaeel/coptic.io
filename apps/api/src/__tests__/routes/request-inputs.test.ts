import { describe, expect, it } from 'vitest'
import { app } from '../../index'
import { INVALID_DATE_MESSAGE, INVALID_YEAR_MESSAGE } from '../../utils/dateUtils'
import { WALL_CLOCK_CACHE_CONTROL } from '../../utils/request'

// Every route that takes a date, with the date at {date}
const DATE_ROUTES = [
	'/api/readings/{date}',
	'/api/calendar/{date}',
	'/api/season/{date}',
	'/api/lent/{date}',
	'/api/verse/{date}',
	'/api/fasting/{date}',
	'/api/celebrations/{date}',
	'/api/synaxarium/{date}',
	'/api/tasbeha?date={date}',
	'/api/tasbeha/sunday?date={date}',
	'/api/tasbeha/monday?date={date}',
	'/api/incense/evening?date={date}',
	'/api/incense/morning?date={date}',
	'/api/liturgy/basil?date={date}',
]

const YEAR_ROUTES = [
	'/api/calendar/month/{year}/1',
	'/api/calendar/ical/{year}',
	'/api/season/year/{year}',
	'/api/season/fasting/{year}',
	'/api/fasting/calendar/{year}',
	'/api/lent/schedule/{year}',
]

describe('date inputs', () => {
	it.each(DATE_ROUTES)('%s rejects an impossible date', async (route) => {
		const res = await app.request(route.replace('{date}', '2026-02-30'))
		expect(res.status).toBe(400)
		expect(await res.json()).toEqual({ error: INVALID_DATE_MESSAGE })
	})

	// Lent answers 404 outside Great Lent; bare /api/celebrations lists every celebration
	const TODAY_ROUTES = DATE_ROUTES.filter(
		(route) => !route.startsWith('/api/lent') && !route.startsWith('/api/celebrations'),
	)

	it.each(TODAY_ROUTES)(
		'%s caches an explicit date for 12h and today for 2 minutes',
		async (route) => {
			const dated = await app.request(route.replace('{date}', '2026-10-27'))
			expect(dated.status).toBe(200)
			expect(dated.headers.get('Cache-Control')).toContain('max-age=43200')

			const today = await app.request(route.replace(/[/?](date=)?\{date\}/, ''))
			expect(today.headers.get('Cache-Control')).toBe(WALL_CLOCK_CACHE_CONTROL)
		},
	)
})

describe('year inputs', () => {
	it.each(YEAR_ROUTES)('%s rejects an unsupported year', async (route) => {
		const res = await app.request(route.replace('{year}', '1500'))
		expect(res.status).toBe(400)
		expect(await res.json()).toEqual({ error: INVALID_YEAR_MESSAGE })
	})
})
