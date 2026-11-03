import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { app } from '../index'

// Hono writes path parameters as :name, OpenAPI as {name}; compare them in one form
const normalize = (path: string) => path.replace(/\{(\w+)\}/g, ':$1')

const getSpec = async () =>
	(await (await app.request('/openapi.json')).json()) as { paths: Record<string, unknown> }

describe('OpenAPI spec', () => {
	it('documents every REST route', async () => {
		const spec = await getSpec()
		const documented = new Set(Object.keys(spec.paths).map(normalize))
		const routes = app.routes
			.filter((route) => route.method === 'GET' && route.path.startsWith('/api/'))
			.map((route) => normalize(route.path))

		expect(routes.filter((route) => !documented.has(route))).toEqual([])
	})

	// Hono's :name and :name? are not OpenAPI; generators need {name}, and an optional
	// parameter is documented as two paths
	it('templates every path parameter as {name}', async () => {
		const spec = await getSpec()
		expect(Object.keys(spec.paths).filter((path) => /[:?]/.test(path))).toEqual([])
	})

	// @coptic/client types its requests from this file; a stale copy lets them drift
	it('matches the spec committed for @coptic/client', async () => {
		const committed = JSON.parse(
			readFileSync(join(import.meta.dirname, '../../../../packages/client/openapi.json'), 'utf8'),
		)
		expect(committed, 'Run `pnpm gen:api-types` and commit the result').toEqual(await getSpec())
	})
})
