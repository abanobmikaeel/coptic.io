import type { Context, Next } from 'hono'
import client from 'prom-client'

// Create a Registry to register metrics
export const register = new client.Registry()

// Add default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({ register })

// Custom metrics for HTTP requests
export const httpRequestDuration = new client.Histogram({
	name: 'http_request_duration_seconds',
	help: 'Duration of HTTP requests in seconds',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
	registers: [register],
})

export const httpRequestsTotal = new client.Counter({
	name: 'http_requests_total',
	help: 'Total number of HTTP requests',
	labelNames: ['method', 'route', 'status_code'],
	registers: [register],
})

export const httpRequestsInFlight = new client.Gauge({
	name: 'http_requests_in_flight',
	help: 'Number of HTTP requests currently being processed',
	labelNames: ['method'],
	registers: [register],
})

export const httpErrorsTotal = new client.Counter({
	name: 'http_errors_total',
	help: 'Total number of HTTP errors (4xx and 5xx)',
	labelNames: ['method', 'route', 'status_code'],
	registers: [register],
})

// Normalize route paths to avoid high cardinality
// e.g., /api/readings/2024-01-15 -> /api/readings/:date
function normalizeRoute(path: string): string {
	return (
		path
			// Date patterns (YYYY-MM-DD)
			.replace(/\/\d{4}-\d{2}-\d{2}/g, '/:date')
			// Numeric IDs
			.replace(/\/\d+/g, '/:id')
			// UUID patterns
			.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:uuid')
	)
}

// Metrics middleware
export async function metricsMiddleware(c: Context, next: Next) {
	const start = performance.now()
	const method = c.req.method

	httpRequestsInFlight.inc({ method })

	try {
		await next()
	} finally {
		const duration = (performance.now() - start) / 1000 // Convert to seconds
		const route = normalizeRoute(c.req.path)
		const statusCode = c.res.status.toString()

		httpRequestsInFlight.dec({ method })

		httpRequestDuration.observe({ method, route, status_code: statusCode }, duration)
		httpRequestsTotal.inc({ method, route, status_code: statusCode })

		// Track errors separately
		if (c.res.status >= 400) {
			httpErrorsTotal.inc({ method, route, status_code: statusCode })
		}
	}
}
