import { describe, expect, it } from 'vitest'
import { app } from '../index'

// Hono writes path parameters as :name, OpenAPI as {name}; compare them in one form
const normalize = (path: string) => path.replace(/\{(\w+)\}/g, ':$1')

describe('OpenAPI spec', () => {
	it('documents every REST route', async () => {
		const spec = (await (await app.request('/openapi.json')).json()) as {
			paths: Record<string, unknown>
		}
		const documented = new Set(Object.keys(spec.paths).map(normalize))
		const routes = app.routes
			.filter((route) => route.method === 'GET' && route.path.startsWith('/api/'))
			.map((route) => normalize(route.path))

		expect(routes.filter((route) => !documented.has(route))).toEqual([])
	})
})
