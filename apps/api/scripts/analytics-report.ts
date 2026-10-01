/**
 * Print API and MCP usage from the Analytics Engine dataset.
 *
 *   CLOUDFLARE_API_TOKEN=... bun scripts/analytics-report.ts [days]
 *
 * The token needs the "Account Analytics: Read" permission. The account is read
 * from CLOUDFLARE_ACCOUNT_ID, or from wrangler.toml when that is unset.
 */
import { readFileSync } from 'node:fs'
import { type CallerRow, queries, summarizeCallers } from '../src/analytics/report'

const days = Number(process.argv[2] ?? 30)
const token = process.env.CLOUDFLARE_API_TOKEN
const accountId =
	process.env.CLOUDFLARE_ACCOUNT_ID ??
	readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8').match(
		/^account_id\s*=\s*"([^"]+)"/m,
	)?.[1]

if (!token || !accountId || !Number.isInteger(days) || days < 1) {
	console.error('Usage: CLOUDFLARE_API_TOKEN=... bun scripts/analytics-report.ts [days]')
	process.exit(1)
}

const sql = async <T>(query: string): Promise<T[]> => {
	const res = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`,
		{
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: `${query} FORMAT JSON`,
		},
	)
	if (!res.ok) throw new Error(`Analytics Engine SQL ${res.status}: ${await res.text()}`)
	return ((await res.json()) as { data: T[] }).data
}

const q = queries(days)
const [byKind, callers, mcpClients, mcpTools, routes] = await Promise.all([
	sql(q.byKind),
	sql<CallerRow>(q.callers),
	sql(q.mcpClients),
	sql(q.mcpTools),
	sql(q.routes),
])
const summary = summarizeCallers(callers)

console.log(`\nUsage over the last ${days} days\n`)
console.log(
	`Distinct projects (excluding coptic.io): ${summary.projects}` +
		` — ${summary.byMethod.client} named, ${summary.byMethod.origin} by website,` +
		` ${summary.byMethod.ua} by HTTP client only (a lower bound)`,
)
console.log('\nRequests by surface')
console.table(byKind)
console.log('Top callers')
console.table(summary.external.slice(0, 25))
console.log('MCP clients (connections)')
console.table(mcpClients)
console.log('MCP tools')
console.table(mcpTools)
console.log('Top REST routes')
console.table(routes)
