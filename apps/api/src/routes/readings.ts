import { gregorianToCoptic } from '@coptic/core'
import { Hono } from 'hono'
import { getByCopticDate } from '../models/readings'
import type { BibleTranslation } from '../types'
import { getStaticCelebrationsForDay } from '../utils/calculations/getStaticCelebrations'

const readings = new Hono()

// Get readings for a specific date or today
readings.get('/:date?', async (c) => {
	try {
		const dateParam = c.req.param('date')
		const isDetailed = c.req.query('detailed') === 'true'
		const langParam = c.req.query('lang')

		// Validate and default language to English
		const translation: BibleTranslation = langParam === 'ar' ? 'ar' : 'en'

		// Default to today
		let parsedDate = new Date()
		if (dateParam) {
			parsedDate = new Date(dateParam)
			// Validate date
			if (Number.isNaN(parsedDate.getTime())) {
				return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
			}
		}

		// Get readings
		const data = await getByCopticDate(parsedDate, isDetailed, translation)

		// Add celebrations and coptic date
		const celebrations = getStaticCelebrationsForDay(parsedDate)
		const copticDate = gregorianToCoptic(parsedDate)

		return c.json({
			...data,
			celebrations,
			fullDate: copticDate,
		})
	} catch (error) {
		console.error('Error fetching readings:', error)
		return c.json(
			{
				error: error instanceof Error ? error.message : 'Failed to fetch readings',
			},
			500,
		)
	}
})

export default readings
