import { isValid, parse } from 'date-fns'
import { Hono } from 'hono'
import * as calendarService from '../services/calendar.service'
import fromGregorian from '../utils/copticDate'

const calendar = new Hono()

// Get calendar month with all data (Coptic dates + fasting)
// Returns everything needed to render a calendar month view
calendar.get('/month/:year/:month', async (c) => {
	try {
		const yearParam = c.req.param('year')
		const monthParam = c.req.param('month')
		const year = Number.parseInt(yearParam)
		const month = Number.parseInt(monthParam)

		const data = calendarService.getCalendarMonth(year, month)
		return c.json(data)
	} catch (error) {
		console.error('Error getting calendar month:', error)
		return c.json(
			{
				error: error instanceof Error ? error.message : 'Failed to get calendar month',
			},
			400,
		)
	}
})

// Get live iCal subscription feed (multi-year)
// IMPORTANT: This must be defined BEFORE /ical/:year to avoid :year matching "subscribe"
calendar.get('/ical/subscribe', async (c) => {
	try {
		const icalContent = calendarService.getSubscriptionCalendar()

		c.header('Content-Type', 'text/calendar; charset=utf-8')
		c.header('Content-Disposition', 'inline; filename="coptic-calendar-live.ics"')
		c.header('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
		c.header('X-WR-CALNAME', 'Coptic Orthodox Calendar')

		return c.body(icalContent)
	} catch (error) {
		console.error('Error generating iCal subscription:', error)
		return c.json(
			{
				error: error instanceof Error ? error.message : 'Failed to generate iCal subscription',
			},
			500,
		)
	}
})

// Get iCal feed for a specific year
calendar.get('/ical/:year', async (c) => {
	try {
		const yearParam = c.req.param('year')
		const year = Number.parseInt(yearParam)

		const icalContent = calendarService.getYearCalendar(year)

		c.header('Content-Type', 'text/calendar; charset=utf-8')
		c.header('Content-Disposition', `inline; filename="coptic-calendar-${year}.ics"`)
		c.header('Cache-Control', 'public, max-age=3600') // Cache for 1 hour

		return c.body(icalContent)
	} catch (error) {
		console.error('Error generating iCal:', error)
		return c.json(
			{
				error: error instanceof Error ? error.message : 'Failed to generate iCal',
			},
			500,
		)
	}
})

// Convert Gregorian date to Coptic date
calendar.get('/:date?', async (c) => {
	try {
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

		const copticDate = fromGregorian(parsedDate)
		return c.json(copticDate)
	} catch (error) {
		console.error('Error converting date:', error)
		return c.json(
			{
				error: error instanceof Error ? error.message : 'Failed to convert date',
			},
			500,
		)
	}
})

export default calendar
