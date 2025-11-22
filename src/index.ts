import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import readingsRoute from './routes/readings'
import calendarRoute from './routes/calendar'

const app = new Hono()

// Middleware
app.use('*', cors())
app.use('*', logger())

// Health check
app.get('/health', (c) => {
	return c.json({ success: true, timestamp: new Date().toISOString() })
})

// Routes
app.route('/api/readings', readingsRoute)
app.route('/api/calendar', calendarRoute)

// 404 handler
app.notFound((c) => {
	return c.json({ error: 'Not Found' }, 404)
})

// Error handler
app.onError((err, c) => {
	console.error(`Error: ${err.message}`)
	return c.json({ error: err.message }, 500)
})

const port = Number(process.env.PORT) || 3000

console.log(`Server is running on port ${port}`)

serve({
	fetch: app.fetch,
	port,
})

export default app