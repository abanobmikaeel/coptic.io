import { Hono } from 'hono'
import { requestDate } from '../middleware/request'
import { getReadingsForDate } from '../services/readings.service'
import { parseTranslation } from '../utils/request'

const readings = new Hono()

// Get readings for a specific date or today
readings.get('/:date?', requestDate(), async (c) => {
	const isDetailed = c.req.query('detailed') === 'true'
	const translation = parseTranslation(c.req.query('lang'))
	return c.json(await getReadingsForDate(c.var.date, isDetailed, translation))
})

export default readings
