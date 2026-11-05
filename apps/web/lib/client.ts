import { API_BASE_URL } from '@/config'
import { createCopticClient } from '@coptic/client'

/**
 * The API client, typed from the API's OpenAPI spec. Its paths start with /api. The server
 * names itself so usage analytics can exclude it; browsers already send their Origin, and
 * a custom header would add a CORS preflight to every call.
 */
export const api = createCopticClient({
	baseUrl: API_BASE_URL.replace(/\/api$/, ''),
	clientName: typeof window === 'undefined' ? 'coptic.io-web' : undefined,
})

/**
 * Request options that cache a server-side fetch in Next.js for `seconds`. openapi-fetch
 * builds a Request object, which carries no `next` option, so it is passed to fetch here.
 */
export const cacheFor = (seconds: number) => ({
	fetch: (request: Request) => fetch(request, { next: { revalidate: seconds } }),
})

/** The response body, or null when the request fails; errors are logged, never thrown. */
export async function dataOrNull<T>(request: Promise<{ data?: T }>): Promise<T | null> {
	try {
		return (await request).data ?? null
	} catch (error) {
		console.error('API error:', error)
		return null
	}
}
