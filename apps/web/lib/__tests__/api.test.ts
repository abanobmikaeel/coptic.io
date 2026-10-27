import { afterEach, describe, expect, it, vi } from 'vitest'
import { getCalendarMonth } from '../api'

afterEach(() => vi.unstubAllGlobals())

describe('fetchApi', () => {
	it('resolves to null when the response body is not valid JSON', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.stubGlobal('fetch', async () => new Response('<html>bad gateway</html>', { status: 200 }))
		await expect(getCalendarMonth(2026, 10)).resolves.toBeNull()
	})

	it('resolves to null on a non-OK status', async () => {
		vi.stubGlobal('fetch', async () => new Response('{}', { status: 503 }))
		await expect(getCalendarMonth(2026, 10)).resolves.toBeNull()
	})
})
