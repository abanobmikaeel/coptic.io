/**
 * @coptic/client - a typed client for the Coptic.io API
 *
 * Paths, parameters and responses are typed from the API's OpenAPI spec
 * (schema.gen.ts, regenerated with `pnpm gen:api-types`), so the client cannot drift
 * from the API it calls.
 *
 * @example
 * ```typescript
 * import { createCopticClient } from '@coptic/client'
 *
 * const client = createCopticClient({ clientName: 'st-mark-app' })
 *
 * // Today's readings, in Arabic
 * const { data } = await client.GET('/api/readings', { params: { query: { lang: 'ar' } } })
 *
 * // A day's fasting
 * const fasting = await client.GET('/api/fasting/{date}', { params: { path: { date: '2026-04-10' } } })
 * ```
 *
 * @packageDocumentation
 */
import createClient, { type ClientOptions } from 'openapi-fetch'
import type { paths } from './schema.gen'

export type { components, paths } from './schema.gen'

export const DEFAULT_BASE_URL = 'https://api.coptic.io'

export type CopticClientOptions = ClientOptions & {
	/**
	 * Your project's name, sent as the X-Client-Name header so its usage can be told
	 * apart from other callers'. Letters, digits and . _ - only (e.g. "st-mark-app").
	 */
	clientName?: string
}

/** A client for the API at `baseUrl` (default https://api.coptic.io). */
export const createCopticClient = ({ clientName, headers, ...options }: CopticClientOptions = {}) =>
	createClient<paths>({
		baseUrl: DEFAULT_BASE_URL,
		...options,
		headers: { ...headers, ...(clientName ? { 'X-Client-Name': clientName } : {}) },
	})

export type CopticClient = ReturnType<typeof createCopticClient>

/** The JSON body a GET path answers with on success, e.g. ApiResponse<'/api/readings/{date}'>. */
export type ApiResponse<P extends keyof paths> = paths[P] extends {
	get: { responses: { 200: { content: { 'application/json': infer Body } } } }
}
	? Body
	: never
