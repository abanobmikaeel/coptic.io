import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import type { Bindings } from './env'
import { yoga } from './graphql'
import { cacheResponse } from './middleware/cache'
import { setBibleBucket } from './models/readings/bibleDataMapper'
import agpeyaRoutes from './routes/agpeya'
import calendarRoutes from './routes/calendar'
import celebrationsRoutes from './routes/celebrations'
import fastingRoutes from './routes/fasting'
import lentRoutes from './routes/lent'
import readingsRoutes from './routes/readings'
import searchRoutes from './routes/search'
import seasonRoutes from './routes/season'
import synaxariumRoutes from './routes/synaxarium'

const app = new OpenAPIHono<{ Bindings: Bindings }>()

app.use('*', cors())
app.use('*', logger())
app.use('*', (c, next) => {
	if (c.env?.BIBLE_BUCKET) setBibleBucket(c.env.BIBLE_BUCKET)
	c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
	return next()
})

// GraphQL endpoint
app.on(['GET', 'POST'], '/graphql', async (c) => {
	const response = await yoga.fetch(c.req.raw, {})
	return response
})

// API Documentation
app.doc('/openapi.json', {
	openapi: '3.0.0',
	info: {
		version: '2.0.0',
		title: 'Coptic.IO API',
		description:
			'A modern API for Coptic Orthodox readings, calendar, and liturgical information. Available as REST and GraphQL.',
	},
	servers: [
		{
			url: 'https://api.coptic.io',
			description: 'Production server',
		},
	],
})

// Health check
app.get('/health', (c) => {
	return c.json({
		success: true,
		timestamp: new Date().toISOString(),
	})
})

// Cache deterministic date-based responses at the CF edge (12h TTL).
// In Bun dev this is a no-op. Only GET requests with a 200 response are cached.
const cache12h = cacheResponse(43200)
app.use('/api/readings/*', cache12h)
app.use('/api/synaxarium/*', cache12h)
app.use('/api/calendar/*', cache12h)
app.use('/api/lent/*', cache12h)
app.use('/api/agpeya/*', cache12h)
app.use('/api/fasting/*', cache12h)
app.use('/api/celebrations/*', cache12h)
app.use('/api/season/*', cache12h)

// REST Routes
app.route('/api/agpeya', agpeyaRoutes)
app.route('/api/readings', readingsRoutes)
app.route('/api/calendar', calendarRoutes)
app.route('/api/celebrations', celebrationsRoutes)
app.route('/api/fasting', fastingRoutes)
app.route('/api/lent', lentRoutes)
app.route('/api/search', searchRoutes)
app.route('/api/synaxarium', synaxariumRoutes)
app.route('/api/season', seasonRoutes)

// 404 handler
app.notFound((c) => {
	return c.json({ error: 'Not Found' }, 404)
})

// Error handler
app.onError((err, c) => {
	console.error(`Error: ${err.message}`, err.stack)
	return c.json({ error: err.message }, 500)
})

// Export the app for tests
export { app }

export default { fetch: app.fetch }
