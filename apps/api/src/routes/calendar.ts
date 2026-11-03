import { gregorianToCoptic, localizeCopticDate } from '@coptic/core'
import { createRoute, z } from '@hono/zod-openapi'
import { requestDate } from '../middleware/request'
import { CalendarMonthSchema, CopticDateSchema, ErrorSchema, IcalInfoSchema } from '../schemas'
import * as calendarService from '../services/calendar.service'
import { INVALID_YEAR_MESSAGE } from '../utils/dateUtils'
import { createApiApp, jsonResponse } from '../utils/openapi'
import { parseYear } from '../utils/request'

const app = createApiApp()

const icalResponse = (description: string) => ({
	description,
	content: { 'text/calendar': { schema: z.string() } },
})

// GET /api/calendar/month/:year/:month
// Everything needed to render a calendar month view: Coptic dates and fasting
const getMonthRoute = createRoute({
	method: 'get',
	path: '/month/{year}/{month}',
	tags: ['Calendar'],
	summary: 'Get a calendar month',
	description:
		'Returns every day of a Gregorian month with its Coptic date and fasting, and the Coptic months it spans.',
	request: {
		params: z.object({
			year: z.string().openapi({ example: '2026' }),
			month: z.string().openapi({ example: '4', description: 'Gregorian month, 1–12' }),
		}),
	},
	responses: {
		200: jsonResponse(CalendarMonthSchema, 'The calendar month'),
		400: jsonResponse(ErrorSchema, 'Invalid year or month'),
	},
})

app.openapi(getMonthRoute, (c) => {
	const params = c.req.valid('param')
	const year = parseYear(params.year)
	const month = Number.parseInt(params.month)

	if (!year) return c.json({ error: INVALID_YEAR_MESSAGE }, 400)
	if (Number.isNaN(month) || month < 1 || month > 12) {
		return c.json({ error: 'Invalid month. Must be between 1 and 12' }, 400)
	}

	return c.json(calendarService.getCalendarMonth(year, month), 200)
})

// GET /api/calendar/ical/info
// Subscription details with a webcal:// URL, for the UI to display
const getIcalInfoRoute = createRoute({
	method: 'get',
	path: '/ical/info',
	tags: ['Calendar'],
	summary: 'Get calendar subscription details',
	description: 'Returns the webcal:// and https:// subscription URLs with instructions.',
	responses: {
		200: jsonResponse(IcalInfoSchema, 'Subscription details'),
	},
})

app.openapi(getIcalInfoRoute, (c) => {
	const host = c.req.header('host') || 'api.coptic.io'
	const protocol = host.includes('localhost') ? 'http' : 'https'

	return c.json(
		{
			webcalUrl: `webcal://${host}/api/calendar/ical/subscribe`,
			httpsUrl: `${protocol}://${host}/api/calendar/ical/subscribe`,
			instructions: {
				title: 'Subscribe to Coptic Orthodox Calendar',
				steps: [
					'Click the subscribe button or copy the calendar URL',
					'Your calendar app will open and ask to add the calendar',
					'Confirm to subscribe — events will sync automatically',
				],
				note: 'Do NOT import the .ics file directly. Subscribe to get automatic updates for feasts and fasting periods.',
			},
		},
		200,
	)
})

// GET /api/calendar/ical/subscribe — the live multi-year feed
// IMPORTANT: This must be registered BEFORE /ical/:year to avoid :year matching "subscribe"
const getIcalSubscribeRoute = createRoute({
	method: 'get',
	path: '/ical/subscribe',
	tags: ['Calendar'],
	summary: 'Subscribe to the calendar feed',
	description: 'Returns a live iCal feed of feasts and fasts across several years.',
	responses: {
		200: icalResponse('iCal feed'),
	},
})

app.openapi(getIcalSubscribeRoute, (c) => {
	c.header('Content-Type', 'text/calendar; charset=utf-8')
	c.header('Content-Disposition', 'inline; filename="coptic-calendar-subscription.ics"')
	c.header('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
	c.header('X-WR-CALNAME', 'Coptic Orthodox Calendar')
	return c.body(calendarService.getSubscriptionCalendar(), 200)
})

// GET /api/calendar/ical/:year
const getIcalYearRoute = createRoute({
	method: 'get',
	path: '/ical/{year}',
	tags: ['Calendar'],
	summary: 'Get the calendar feed for a year',
	description: 'Returns the iCal feed of feasts and fasts in a Gregorian year.',
	request: {
		params: z.object({ year: z.string().openapi({ example: '2026' }) }),
	},
	responses: {
		200: icalResponse('iCal feed for the year'),
		400: jsonResponse(ErrorSchema, 'Invalid year'),
	},
})

app.openapi(getIcalYearRoute, (c) => {
	const year = parseYear(c.req.valid('param').year)
	if (!year) return c.json({ error: INVALID_YEAR_MESSAGE }, 400)

	c.header('Content-Type', 'text/calendar; charset=utf-8')
	c.header('Content-Disposition', `inline; filename="coptic-calendar-${year}.ics"`)
	c.header('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
	return c.body(calendarService.getYearCalendar(year), 200)
})

// GET /api/calendar/:date — convert a Gregorian date to the Coptic calendar
const getForDateRoute = createRoute({
	method: 'get',
	path: '/:date?',
	tags: ['Calendar'],
	summary: 'Convert a date to the Coptic calendar',
	description: 'Returns the Coptic date of a Gregorian date. Defaults to today.',
	middleware: [requestDate()] as const,
	request: {
		params: z.object({ date: z.string().optional().openapi({ example: '2026-09-11' }) }),
		query: z.object({
			lang: z.string().optional().openapi({
				example: 'ar',
				description: 'en, ar or es; anything else reads English',
			}),
		}),
	},
	responses: {
		200: jsonResponse(CopticDateSchema, 'The Coptic date'),
		400: jsonResponse(ErrorSchema, 'Invalid date'),
	},
})

app.openapi(getForDateRoute, (c) => {
	const langQuery = c.req.valid('query').lang
	const lang = langQuery && ['en', 'ar', 'es'].includes(langQuery) ? langQuery : 'en'
	return c.json(localizeCopticDate(gregorianToCoptic(c.var.date), lang), 200)
})

export default app
