import { describe, expect, it, vi } from 'vitest'

// Run each request as the first in a fresh Workers isolate. In dev and tests every
// Bible translation is preloaded at module init, which hides a route that forgets to
// load one; with IS_WORKERS set, translations load only on demand, from the R2 bucket
// below, exactly as in production.
vi.hoisted(() => {
	Object.assign(globalThis, {
		IS_WORKERS: true,
		// An always-missing edge cache
		caches: { default: { match: async () => undefined, put: async () => {} } },
	})
})

const bucket = {
	get: async (key: string) => {
		const lang = key.replace(/^bible-|\.json$/g, '')
		const { bibleData } = await import(`@coptic/data/${lang}`)
		return { json: async () => bibleData }
	},
}
const executionCtx = { waitUntil: () => {}, passThroughOnException: () => {}, props: {} }

const requestInFreshIsolate = async (path: string) => {
	vi.resetModules()
	const { app } = await import('../../index')
	return app.request(path, {}, { BIBLE_BUCKET: bucket }, executionCtx)
}

// Every route that prints scripture, in a translation other than English
const SCRIPTURE_ROUTES = [
	'/api/readings/2026-11-01?detailed=true&lang=ar',
	'/api/verse/2026-05-20?lang=ar',
	'/api/lent/2026-03-02?detailed=true&lang=ar',
	'/api/agpeya?lang=ar',
	'/api/agpeya/prime?lang=ar',
	'/api/agpeya/hours?lang=ar',
	'/api/agpeya/midnight/watch/1?lang=ar',
	'/api/incense/evening?date=2026-06-01&lang=ar',
	'/api/incense/morning?date=2026-06-01&lang=ar',
	'/api/liturgy/basil?date=2026-06-01&lang=ar',
	'/api/search?q=John%203:16',
]

describe('scripture routes in a fresh Workers isolate', () => {
	it.each(SCRIPTURE_ROUTES)('%s loads its translation before reading it', async (path) => {
		const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
		const res = await requestInFreshIsolate(path)
		expect(res.status, JSON.stringify(errors.mock.calls[0]?.[1]?.message)).toBe(200)
		errors.mockRestore()
	})
})
