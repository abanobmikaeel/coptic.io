import { describe, expect, it } from 'vitest'
import { DATASET } from '../../analytics/record'
import { queries, summarizeCallers } from '../../analytics/report'

describe('summarizeCallers', () => {
	it('counts distinct projects other than coptic.io, by how each was identified', () => {
		const summary = summarizeCallers([
			{ caller: 'origin:coptic.io', requests: '900' },
			{ caller: 'client:coptic.io-web', requests: 500 },
			{ caller: 'origin:localhost:3000', requests: 40 },
			{ caller: 'client:st-mark-app', requests: '120' },
			{ caller: 'origin:church.example', requests: 30 },
			{ caller: 'origin:other.example', requests: 3 },
			{ caller: 'ua:python-requests', requests: 12 },
		])

		expect(summary.projects).toBe(4)
		expect(summary.byMethod).toEqual({ client: 1, origin: 2, ua: 1 })
		expect(summary.external[0]).toEqual({ caller: 'client:st-mark-app', requests: 120 })
	})

	it('handles no traffic', () => {
		expect(summarizeCallers([])).toEqual({
			projects: 0,
			byMethod: { client: 0, origin: 0, ua: 0 },
			external: [],
		})
	})
})

describe('queries', () => {
	it('weights every count by the sample interval and bounds the time window', () => {
		for (const query of Object.values(queries(7))) {
			expect(query).toContain(`FROM ${DATASET}`)
			expect(query).toContain("INTERVAL '7' DAY")
			expect(query).not.toMatch(/count\(\*\)/i)
		}
	})
})
