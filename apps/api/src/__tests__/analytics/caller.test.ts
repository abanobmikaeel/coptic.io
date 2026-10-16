import { describe, expect, it } from 'vitest'
import { hostOf, identifyCaller, routePattern, uaProduct } from '../../analytics/caller'

const headers = (init: Record<string, string>) => new Headers(init)

describe('identifyCaller', () => {
	it('prefers an explicit client name over origin and user agent', () => {
		const caller = identifyCaller(
			headers({
				'X-Client-Name': 'St-Mark App',
				Origin: 'https://stmark.org',
				'User-Agent': 'curl/8.4',
			}),
		)
		expect(caller).toEqual({
			key: 'client:st-markapp',
			clientName: 'st-markapp',
			originHost: 'stmark.org',
			uaProduct: 'curl',
		})
	})

	it('uses the browser origin when no client name is sent', () => {
		const caller = identifyCaller(
			headers({ Origin: 'https://www.stmark.org', 'User-Agent': 'Mozilla/5.0' }),
		)
		expect(caller.key).toBe('origin:www.stmark.org')
		expect(caller.uaProduct).toBe('browser')
	})

	it('falls back to the referer host when there is no origin', () => {
		const caller = identifyCaller(headers({ Referer: 'https://church.example/page?x=1' }))
		expect(caller.key).toBe('origin:church.example')
	})

	it('falls back to the HTTP client product for backend callers', () => {
		expect(identifyCaller(headers({ 'User-Agent': 'python-requests/2.31.0' })).key).toBe(
			'ua:python-requests',
		)
		expect(identifyCaller(headers({})).key).toBe('ua:(none)')
	})

	it('caps an over-long client name', () => {
		const caller = identifyCaller(headers({ 'X-Client-Name': 'a'.repeat(500) }))
		expect(caller.clientName).toHaveLength(64)
	})
})

describe('hostOf', () => {
	it('returns an empty host for a missing or malformed value', () => {
		expect(hostOf(null)).toBe('')
		expect(hostOf('not a url')).toBe('')
		expect(hostOf('http://localhost:3000')).toBe('localhost:3000')
	})
})

describe('uaProduct', () => {
	it('takes the first product token', () => {
		expect(uaProduct('node')).toBe('node')
		expect(uaProduct('openai-mcp/1.0.0 (+https://openai.com)')).toBe('openai-mcp')
		expect(uaProduct('   ')).toBe('(none)')
	})
})

describe('routePattern', () => {
	it('replaces dates and other parameters, keeping fixed words', () => {
		expect(routePattern('/api/readings/2026-01-07')).toBe('/api/readings/:date')
		expect(routePattern('/api/calendar/month/2026/4')).toBe('/api/calendar/month/:param/:param')
		expect(routePattern('/api/synaxarium/coptic/7%20Toba')).toBe('/api/synaxarium/coptic/:param')
		expect(routePattern('/api/agpeya/terce')).toBe('/api/agpeya/terce')
		expect(routePattern('/graphql')).toBe('/graphql')
	})
})
