import { COLUMNS, DATASET } from './record'

/**
 * Queries and summaries for the usage dataset. Every count is weighted by
 * _sample_interval, which is how Analytics Engine accounts for sampled rows.
 */

/** Callers that are coptic.io itself, excluded when counting other projects. */
export const OWN_CALLERS = [
	'origin:coptic.io',
	'origin:www.coptic.io',
	'client:coptic.io',
	'client:coptic.io-web',
]

const isOwn = (caller: string): boolean =>
	OWN_CALLERS.includes(caller) || caller.startsWith('origin:localhost')

const { kind, route, status, mcpClient } = COLUMNS

const since = (days: number) => `timestamp > NOW() - INTERVAL '${Math.trunc(days)}' DAY`

export const queries = (days: number) => ({
	byKind: `SELECT ${kind} AS kind, SUM(_sample_interval) AS requests, count(DISTINCT index1) AS callers FROM ${DATASET} WHERE ${since(days)} GROUP BY kind ORDER BY requests DESC`,
	callers: `SELECT index1 AS caller, SUM(_sample_interval) AS requests, max(timestamp) AS lastSeen FROM ${DATASET} WHERE ${since(days)} GROUP BY caller ORDER BY requests DESC LIMIT 1000`,
	mcpClients: `SELECT ${mcpClient} AS client, SUM(_sample_interval) AS connections FROM ${DATASET} WHERE ${since(days)} AND ${kind} = 'mcp' AND ${route} = 'initialize' GROUP BY client ORDER BY connections DESC`,
	mcpTools: `SELECT ${route} AS tool, SUM(_sample_interval) AS calls, sumIf(_sample_interval, ${status} = 'error') AS errors FROM ${DATASET} WHERE ${since(days)} AND ${kind} = 'mcp' AND ${route} != 'initialize' GROUP BY tool ORDER BY calls DESC`,
	routes: `SELECT ${route} AS route, SUM(_sample_interval) AS requests FROM ${DATASET} WHERE ${since(days)} AND ${kind} = 'rest' GROUP BY route ORDER BY requests DESC LIMIT 25`,
})

export interface CallerRow {
	caller: string
	requests: number | string
}

export interface CallerSummary {
	/** Distinct callers other than coptic.io itself. */
	projects: number
	/** How each was identified: named itself, browser origin, or only an HTTP client. */
	byMethod: { client: number; origin: number; ua: number }
	/** Callers other than coptic.io, busiest first. */
	external: { caller: string; requests: number }[]
}

/**
 * Count distinct projects. Callers known only by HTTP client ('ua:python-requests')
 * may each be many projects sharing one tool, so that part is a lower bound.
 */
export const summarizeCallers = (rows: CallerRow[]): CallerSummary => {
	const external = rows
		.filter((row) => !isOwn(row.caller))
		.map((row) => ({ caller: row.caller, requests: Number(row.requests) }))
	const byMethod = { client: 0, origin: 0, ua: 0 }
	for (const { caller: key } of external) {
		const method = key.slice(0, key.indexOf(':')) as keyof typeof byMethod
		if (method in byMethod) byMethod[method]++
	}
	return { projects: external.length, byMethod, external }
}
