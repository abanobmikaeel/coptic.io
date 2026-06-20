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

		// Workers path: check CF Cache API first, then store on miss.
		// Fold the deploy version into the cache key so every deploy serves fresh
		// responses — e.g. after re-uploading Bible data to R2 — instead of stale
		// entries that would otherwise linger for the full TTL.
		const cacheKey = versionedCacheKey(c.req.raw, c.req.url, c.env.DATA_VERSION)
		const cached = await caches.default.match(cacheKey)
		if (cached) return cached

		await next()

		if (c.res.status === 200) {
			const headers = new Headers(c.res.headers)
			headers.set('Cache-Control', `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}`)
			const toCache = new Response(c.res.clone().body, { status: 200, headers })
			c.executionCtx.waitUntil(caches.default.put(cacheKey, toCache))
		}
		return undefined
	}

// Append the deploy version to the request URL so a new deploy produces a fresh
// cache namespace. Falls back to "dev" when DATA_VERSION isn't injected (local).
const versionedCacheKey = (raw: Request, url: string, version: string | undefined): Request => {
	const keyUrl = new URL(url)
	keyUrl.searchParams.set('__v', version ?? 'dev')
	return new Request(keyUrl.toString(), raw)
}
