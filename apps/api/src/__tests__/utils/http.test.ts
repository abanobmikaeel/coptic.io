import type { Context } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import { INTERNAL_ERROR_MESSAGE, internalError } from '../../utils/http'

// Minimal context stub: internalError only needs c.json(body, status).
const stubContext = (): Context =>
	({
		json: (body: unknown, status: number) => new Response(JSON.stringify(body), { status }),
	}) as unknown as Context

describe('internalError (public-safe error envelope)', () => {
	it('returns a generic 500 envelope', async () => {
		const res = internalError(stubContext(), 'readings', new Error('DB connection refused'))
		expect(res.status).toBe(500)
		expect(await res.json()).toEqual({ error: INTERNAL_ERROR_MESSAGE })
	})

	it('never leaks the underlying error message', async () => {
		const secret = 'postgres://user:s3cret@host:5432/db'
		const res = internalError(stubContext(), 'scope', new Error(secret))
		const text = await res.clone().text()

		expect(text).not.toContain(secret)
		expect(text).not.toContain('s3cret')
	})

	it('logs the internal error server-side for debugging', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
		internalError(stubContext(), 'readings', new Error('boom'))

		expect(spy).toHaveBeenCalledOnce()
		spy.mockRestore()
	})
})
