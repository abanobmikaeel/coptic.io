import { gregorianToCoptic, localizeCopticDate } from '@coptic/core'
import { isValid, parse } from 'date-fns'
import { Hono } from 'hono'
import * as calendarService from '../services/calendar.service'

const calendar = new Hono()

// Get calendar month with all data (Coptic dates + fasting)
// Returns everything needed to render a calendar month view
calendar.get('/month/:year/:month', async (c) => {
	const year = Number.parseInt(c.req.param('year'))
	const month = Number.parseInt(c.req.param('month'))

	if (Number.isNaN(year) || year < 1900 || year > 2199) {
		return c.json({ error: 'Invalid year. Must be between 1900 and 2199' }, 400)
	}
	if (Number.isNaN(month) || month < 1 || month > 12) {
		return c.json({ error: 'Invalid month. Must be between 1 and 12' }, 400)
	}

	const data = calendarService.getCalendarMonth(year, month)
	return c.json(data)
})

// Get subscription info with webcal:// URL (for UI to display)
calendar.get('/ical/info', async (c) => {
	const host = c.req.header('host') || 'api.coptic.io'
	const protocol = host.includes('localhost') ? 'http' : 'https'
	const webcalUrl = `webcal://${host}/api/calendar/ical/subscribe`
	const httpsUrl = `${protocol}://${host}/api/calendar/ical/subscribe`

	return c.json({
		webcalUrl,
		httpsUrl,
		instructions: {
			title: 'Subscribe to Coptic Orthodox Calendar',
			steps: [
				'Click the subscribe button or copy the calendar URL',
				'Your calendar app will open and ask to add the calendar',
				'Confirm to subscribe — events will sync automatically',
			],
			note: 'Do NOT import the .ics file directly. Subscribe to get automatic updates for feasts and fasting periods.',
		},
	})
})

// Get live iCal subscription feed (multi-year)
// IMPORTANT: This must be defined BEFORE /ical/:year to avoid :year matching "subscribe"
calendar.get('/ical/subscribe', async (c) => {
	const icalContent = calendarService.getSubscriptionCalendar()

	c.header('Content-Type', 'text/calendar; charset=utf-8')
	c.header('Content-Disposition', 'inline; filename="coptic-calendar-subscription.ics"')
	c.header('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
	c.header('X-WR-CALNAME', 'Coptic Orthodox Calendar')

	return c.body(icalContent)
})

// Get iCal feed for a specific year
calendar.get('/ical/:year', async (c) => {
	const yearParam = c.req.param('year')
	const year = Number.parseInt(yearParam)

	const icalContent = calendarService.getYearCalendar(year)

	c.header('Content-Type', 'text/calendar; charset=utf-8')
	c.header('Content-Disposition', `inline; filename="coptic-calendar-${year}.ics"`)
	c.header('Cache-Control', 'public, max-age=3600') // Cache for 1 hour

	return c.body(icalContent)
})

// Convert Gregorian date to Coptic date
calendar.get('/:date?', async (c) => {
	const dateParam = c.req.param('date')

	// Default to today
	let parsedDate: Date
	if (dateParam) {
		parsedDate = parse(dateParam, 'yyyy-MM-dd', new Date())
		if (!isValid(parsedDate)) {
			return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
		}
	} else {
		parsedDate = new Date()
	}

	const lang = c.req.query('lang') || 'en'
	const copticDate = localizeCopticDate(gregorianToCoptic(parsedDate), lang)
	return c.json(copticDate)
})

export default calendar
