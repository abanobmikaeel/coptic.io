import { Hono } from 'hono'
import { requestDate } from '../middleware/request'
import { getDailyVerse } from '../services/daily-verse.service'
import { parseTranslation } from '../utils/request'

const verse = new Hono()

// Get the daily verse for a specific date or today
verse.get('/:date?', requestDate(), async (c) => {
	const result = await getDailyVerse(c.var.date, parseTranslation(c.req.query('lang')))
	if (!result) {
		return c.json({ error: 'No verse for date' }, 404)
	}

	return c.json(result)
})

export default verse
