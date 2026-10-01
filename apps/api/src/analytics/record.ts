import type { AnalyticsEngineDataset } from '../env'
import { identifyCaller, routePattern } from './caller'

/** The Analytics Engine dataset named in wrangler.toml. */
export const DATASET = 'coptic_api_requests'

/**
 * Column layout of each event. Analytics Engine columns are positional
 * (blob1..blob20), so the writer and every query read their names from here.
 * Append new columns only: renumbering one misreads every event already stored.
 */
export const COLUMNS = {
	kind: 'blob1',
	route: 'blob2',
	status: 'blob3',
	caller: 'blob4',
	originHost: 'blob5',
	uaProduct: 'blob6',
	clientName: 'blob7',
	country: 'blob8',
	method: 'blob9',
	durationMs: 'double1',
} as const

export type Kind = 'rest' | 'graphql' | 'other'

export interface Usage {
	kind: Kind
	route: string
	status: string
	durationMs: number
}

export const kindOf = (pathname: string): Kind => {
	if (pathname.startsWith('/api/')) return 'rest'
	if (pathname === '/graphql') return 'graphql'
	return 'other'
}

/** The route and status for an HTTP response; unmatched paths share one row. */
export const httpUsage = (request: Request, status: number, durationMs: number): Usage => {
	const { pathname } = new URL(request.url)
	return {
		kind: kindOf(pathname),
		route: status === 404 ? '(not found)' : routePattern(pathname),
		status: String(status),
		durationMs,
	}
}

const countryOf = (request: Request): string =>
	(request as { cf?: { country?: string } }).cf?.country ?? ''

/**
 * Write one usage event. Analytics must never affect a response, so a missing
 * binding (dev, previews, tests) is a no-op and a failed write is swallowed.
 */
export const recordUsage = (
	dataset: AnalyticsEngineDataset | undefined,
	request: Request,
	usage: Usage,
): void => {
	if (!dataset) return
	try {
		const caller = identifyCaller(request.headers)
		dataset.writeDataPoint({
			// Order matches COLUMNS.
			blobs: [
				usage.kind,
				usage.route,
				usage.status,
				caller.key,
				caller.originHost,
				caller.uaProduct,
				caller.clientName,
				countryOf(request),
				request.method,
			],
			doubles: [usage.durationMs],
			// The index is the sampling key: sampling stays fair per caller.
			indexes: [caller.key],
		})
	} catch (error) {
		console.error('Error in recordUsage:', error)
	}
}
