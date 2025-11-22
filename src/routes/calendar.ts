import { Hono } from 'hono'
import fromGregorian from '../utils/copticDate'
import { generateYearCalendar, generateMultiYearCalendar } from '../utils/icalGenerator'

const calendar = new Hono()

// Get iCal feed for a specific year
calendar.get('/ical/:year', async (c) => {
	try {
		const yearParam = c.req.param('year')
		const year = parseInt(yearParam)

		if (isNaN(year) || year < 1900 || year > 2199) {
			return c.json({ error: 'Invalid year. Must be between 1900 and 2199' }, 400)
		}

		const icalContent = generateYearCalendar(year)

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
			500
		)
	}
})

// Get live iCal subscription feed (multi-year)
calendar.get('/ical/subscribe', async (c) => {
	try {
		const currentYear = new Date().getFullYear()
		const startYear = currentYear - 1
		const endYear = currentYear + 2 // Include previous year, current, and next 2 years

		const icalContent = generateMultiYearCalendar(startYear, endYear)

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
			500
		)
	}
})

// Convert Gregorian date to Coptic date
calendar.get('/:date?', async (c) => {
	try {
		const dateParam = c.req.param('date')

		// Default to today
		let parsedDate = new Date()
		if (dateParam) {
			parsedDate = new Date(dateParam)
			// Validate date
			if (isNaN(parsedDate.getTime())) {
				return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
			}
		}

		const copticDate = fromGregorian(parsedDate)
		return c.json(copticDate)
	} catch (error) {
		console.error('Error converting date:', error)
		return c.json(
			{
				error: error instanceof Error ? error.message : 'Failed to convert date',
			},
			500
		)
	}
})

export default calendar