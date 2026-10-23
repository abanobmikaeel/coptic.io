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

export type Bindings = {
	BIBLE_BUCKET: R2Bucket
	// Usage analytics. Bound in production only, so previews and dev record nothing.
	ANALYTICS?: AnalyticsEngineDataset
	// Deploy identifier (git SHA) injected at `wrangler deploy --var DATA_VERSION:<sha>`.
	// Folded into the edge cache key so every deploy serves fresh responses instead of
	// stale cached ones (e.g. after re-uploading Bible data to R2). Undefined in dev.
	DATA_VERSION?: string
	// Subscriptions database. Absent in PR previews, where the subscription routes answer 503.
	HYPERDRIVE?: { connectionString: string }
	// SES credentials for subscription emails (secrets), plus optional overrides.
	AWS_ACCESS_KEY_ID?: string
	AWS_SECRET_ACCESS_KEY?: string
	AWS_REGION?: string
	SES_FROM_EMAIL?: string
	SITE_URL?: string
}
