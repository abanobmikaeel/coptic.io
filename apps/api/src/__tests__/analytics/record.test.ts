import type { ExecutionContext } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { COLUMNS, recordUsage } from '../../analytics/record'
import type { AnalyticsEngineDataset, Bindings } from '../../env'
import worker from '../../index'

type Event = Parameters<AnalyticsEngineDataset['writeDataPoint']>[0]

let events: Event[] = []
const dataset: AnalyticsEngineDataset = { writeDataPoint: (event) => events.push(event) }
const env = { ANALYTICS: dataset } as Bindings
const ctx = { waitUntil: () => {}, passThroughOnException: () => {}, props: {} } as ExecutionContext

const get = (path: string, headers: Record<string, string> = {}) =>
	worker.fetch(new Request(`http://localhost${path}`, { headers }), env, ctx)

/** An event's columns by name, read back through the shared layout. */
const columns = (event: Event | undefined) => {
	const named: Record<string, string | number | undefined> = {}
	for (const [name, column] of Object.entries(COLUMNS)) {
		const position = Number(column.replace(/\D/g, '')) - 1
		named[name] = column.startsWith('blob') ? event?.blobs?.[position] : event?.doubles?.[position]
	}
	return named
}

beforeEach(() => {
	events = []
})

describe('usage recording', () => {
	it('records one event per REST request, keyed by caller', async () => {
		await get('/api/readings/2026-01-07', { 'X-Client-Name': 'my-app', 'User-Agent': 'curl/8' })

		expect(events).toHaveLength(1)
		expect(events[0]?.indexes).toEqual(['client:my-app'])
		expect(columns(events[0])).toMatchObject({
			kind: 'rest',
			route: '/api/readings/:date',
			status: '200',
			caller: 'client:my-app',
			uaProduct: 'curl',
			clientName: 'my-app',
			method: 'GET',
		})
		expect(columns(events[0]).durationMs).toBeTypeOf('number')
	})

	it('groups unmatched paths into one route', async () => {
		await get('/api/no-such-thing/abc')
		expect(columns(events[0])).toMatchObject({ route: '(not found)', status: '404' })
	})

	it('tags GraphQL as its own surface', async () => {
		await get('/graphql?query=%7B__typename%7D')
		expect(columns(events[0])).toMatchObject({ kind: 'graphql', route: '/graphql' })
	})

	it('records nothing without the binding', async () => {
		const res = await worker.fetch(new Request('http://localhost/health'), {} as Bindings, ctx)
		expect(res.status).toBe(200)
		expect(events).toEqual([])
	})

	it('never lets a failed write affect the response', async () => {
		const failing = {
			writeDataPoint: () => {
				throw new Error('dataset unavailable')
			},
		}
		const error = vi.spyOn(console, 'error').mockImplementation(() => {})
		const res = await worker.fetch(
			new Request('http://localhost/health'),
			{ ANALYTICS: failing } as Bindings,
			ctx,
		)
		expect(res.status).toBe(200)
		expect(error).toHaveBeenCalled()
		error.mockRestore()
	})

	it('tags the country Cloudflare attaches to the request', () => {
		const request = Object.assign(new Request('http://localhost/api/season'), {
			cf: { country: 'EG' },
		})
		recordUsage(dataset, request, {
			kind: 'rest',
			route: '/api/season',
			status: '200',
			durationMs: 1,
		})
		expect(columns(events[0]).country).toBe('EG')
	})
})
