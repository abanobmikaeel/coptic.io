/**
 * Who is calling the API, derived from what the request already says about itself.
 * No IP address is read or stored: callers are told apart by an opt-in client name,
 * the browser origin, and the HTTP client product, in that order of precedence.
 */

/** Opt-in header a project sends to be counted under its own name. */
export const CLIENT_NAME_HEADER = 'X-Client-Name'

const MAX_LENGTH = 64

/** Lowercase, keep only name-safe characters, and cap the length. */
const sanitize = (value: string): string =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9._:@/-]/g, '')
		.slice(0, MAX_LENGTH)

/** The host of an Origin or Referer header, or '' when absent or malformed. */
export const hostOf = (value: string | null): string => {
	if (!value) return ''
	try {
		return sanitize(new URL(value).host)
	} catch {
		return ''
	}
}

/**
 * The HTTP client product from a User-Agent: 'python-requests/2.31' -> 'python-requests'.
 * Every browser starts with 'Mozilla', so browsers collapse into one 'browser' bucket.
 */
export const uaProduct = (userAgent: string | null): string => {
	const product = userAgent?.trim().split(/[\s/]/, 1)[0] ?? ''
	if (!product) return '(none)'
	return product === 'Mozilla' ? 'browser' : sanitize(product)
}

export interface Caller {
	/** Stable key for counting distinct callers, prefixed by how it was derived. */
	key: string
	clientName: string
	originHost: string
	uaProduct: string
}

export const identifyCaller = (headers: Headers): Caller => {
	const clientName = sanitize(headers.get(CLIENT_NAME_HEADER) ?? '')
	const originHost = hostOf(headers.get('Origin') ?? headers.get('Referer'))
	const product = uaProduct(headers.get('User-Agent'))
	const key = clientName
		? `client:${clientName}`
		: originHost
			? `origin:${originHost}`
			: `ua:${product}`
	return { key, clientName, originHost, uaProduct: product }
}

/**
 * A route pattern for grouping, so per-date paths do not each become their own row:
 * '/api/readings/2026-01-07' -> '/api/readings/:date'. Any segment that is not a
 * plain lowercase word is a parameter.
 */
export const routePattern = (pathname: string): string =>
	pathname
		.split('/')
		.map((segment) => {
			if (segment === '' || /^[a-z][a-z-]*$/.test(segment)) return segment
			return /^\d{4}-\d{2}-\d{2}$/.test(segment) ? ':date' : ':param'
		})
		.join('/')
