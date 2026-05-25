// Minimal R2 typings — avoids requiring @cloudflare/workers-types globally
export interface R2ObjectBody {
	json<T = unknown>(): Promise<T>
}

export interface R2Bucket {
	get(key: string): Promise<R2ObjectBody | null>
}

export type Bindings = {
	BIBLE_BUCKET: R2Bucket
}
