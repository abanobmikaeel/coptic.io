// Minimal R2 typings — avoids requiring @cloudflare/workers-types globally
export interface R2ObjectBody {
	json<T = unknown>(): Promise<T>
}

export interface R2Bucket {
	get(key: string): Promise<R2ObjectBody | null>
}

// Minimal Workers Analytics Engine typing, for the same reason.
export interface AnalyticsEngineDataset {
	writeDataPoint(event: { blobs?: string[]; doubles?: number[]; indexes?: string[] }): void
}

// Minimal D1 typing, for the same reason.
export interface D1PreparedStatement {
	bind(...values: unknown[]): D1PreparedStatement
	all<T = unknown>(): Promise<{ results: T[] }>
}

export interface D1Database {
	prepare(query: string): D1PreparedStatement
}

export type Bindings = {
	BIBLE_BUCKET: R2Bucket
	// Usage analytics. Bound in production only, so previews and dev record nothing.
	ANALYTICS?: AnalyticsEngineDataset
	// Deploy identifier (git SHA) injected at `wrangler deploy --var DATA_VERSION:<sha>`.
	// Folded into the edge cache key so every deploy serves fresh responses instead of
	// stale cached ones (e.g. after re-uploading Bible data to R2). Undefined in dev.
	DATA_VERSION?: string
	// Subscriptions database. Absent in PR previews, where the subscription routes answer 503.
	SUBSCRIPTIONS_DB?: D1Database
	// SES credentials for subscription emails (secrets), plus optional overrides.
	AWS_ACCESS_KEY_ID?: string
	AWS_SECRET_ACCESS_KEY?: string
	AWS_REGION?: string
	SES_FROM_EMAIL?: string
	SITE_URL?: string
	// SNS topic ARNs allowed to call the SES webhook, comma-separated (secret).
	SES_SNS_TOPIC_ARNS?: string
}
