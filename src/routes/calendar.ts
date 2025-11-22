import { Hono } from 'hono'
import fromGregorian from '../utils/copticDate'

const calendar = new Hono()

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

		const copticDate = await fromGregorian(parsedDate)
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