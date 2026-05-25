import type { Context, Next } from 'hono'
import type { Bindings } from '../env'

declare const IS_WORKERS: boolean | undefined

// CF Workers exposes caches.default but the type isn't in standard TS libs
declare const caches: { default: Cache }

export const cacheResponse =
	(ttlSeconds = 43200) =>
	async (c: Context<{ Bindings: Bindings }>, next: Next): Promise<undefined | Response> => {
		if (typeof IS_WORKERS === 'undefined') {
			// Bun dev path: run handler then set Cache-Control so any upstream cache respects TTL
			await next()
			if (c.res.status === 200) {
				const headers = new Headers(c.res.headers)
				headers.set('Cache-Control', `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}`)
				c.res = new Response(c.res.body, { status: 200, headers })
			}
			return
		}

		// Workers path: check CF Cache API first, then store on miss
		const cached = await caches.default.match(c.req.raw)
		if (cached) return cached

		await next()

		if (c.res.status === 200) {
			const headers = new Headers(c.res.headers)
			headers.set('Cache-Control', `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}`)
			const toCache = new Response(c.res.clone().body, { status: 200, headers })
			c.executionCtx.waitUntil(caches.default.put(c.req.raw, toCache))
		}
		return undefined
	}
