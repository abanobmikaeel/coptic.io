// Minimal R2 typings — avoids requiring @cloudflare/workers-types globally
export interface R2ObjectBody {
	json<T = unknown>(): Promise<T>
}

export interface R2Bucket {
	get(key: string): Promise<R2ObjectBody | null>
}

export type Bindings = {
	BIBLE_BUCKET: R2Bucket
	// Deploy identifier (git SHA) injected at `wrangler deploy --var DATA_VERSION:<sha>`.
	// Folded into the edge cache key so every deploy serves fresh responses instead of
	// stale cached ones (e.g. after re-uploading Bible data to R2). Undefined in dev.
	DATA_VERSION?: string
}
