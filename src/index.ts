import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import readingsRoutes from './routes/readings'
import calendarRoutes from './routes/calendar'
import celebrationsRoutes from './routes/celebrations'
import fastingRoutes from './routes/fasting'
import synaxariumRoutes from './routes/synaxarium'
import seasonRoutes from './routes/season'
import { yoga } from './graphql'
import { serve } from '@hono/node-server'

const app = new OpenAPIHono()

// Middleware
app.use('*', cors())
app.use('*', logger())

// GraphQL endpoint
app.on(['GET', 'POST'], '/graphql', async (c) => {
	const response = await yoga.fetch(c.req.raw, {
		// Pass Hono context if needed
	})
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
			url: 'http://localhost:3000',
			description: 'Development server',
		},
	],
})

// Health check
app.get('/health', (c) => {
	return c.json({ success: true, timestamp: new Date().toISOString() })
})

// REST Routes
app.route('/api/readings', readingsRoutes)
app.route('/api/calendar', calendarRoutes)
app.route('/api/celebrations', celebrationsRoutes)
app.route('/api/fasting', fastingRoutes)
app.route('/api/synaxarium', synaxariumRoutes)
app.route('/api/season', seasonRoutes)

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

// Only start server if not in test environment
if (import.meta.env?.VITEST !== true && process.env.NODE_ENV !== 'test') {
	console.log(`Server is running on port ${port}`)
	console.log(`GraphQL Playground: http://localhost:${port}/graphql`)
	console.log(`OpenAPI Spec: http://localhost:${port}/openapi.json`)

	serve({
		fetch: app.fetch,
		port,
	})
}

export default app
