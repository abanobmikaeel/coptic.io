import { Client } from 'pg'
import type { Bindings } from '../../env'

export interface Db {
	query<T>(text: string, params?: unknown[]): Promise<T[]>
	queryOne<T>(text: string, params?: unknown[]): Promise<T | null>
	close(): Promise<void>
}

/** Thrown when no database is configured, so routes can answer 503 instead of 500. */
export class DatabaseUnavailableError extends Error {
	constructor() {
		super('Subscriptions database is not configured')
	}
}

// Workers get the connection string from the Hyperdrive binding. Under Bun (local dev)
// there are no bindings, so fall back to DATABASE_URL.
const connectionStringFor = (env?: Bindings): string | undefined =>
	env?.HYPERDRIVE?.connectionString ?? globalThis.process?.env?.DATABASE_URL

/**
 * Opens one connection for the lifetime of a request. Hyperdrive pools the real
 * connections to the origin, so a per-request client is cheap and avoids sharing
 * sockets across requests (which Workers do not allow).
 */
export const openDb = async (env?: Bindings): Promise<Db> => {
	const connectionString = connectionStringFor(env)
	if (!connectionString) throw new DatabaseUnavailableError()

	const client = new Client({ connectionString })
	await client.connect()

	const query = async <T>(text: string, params?: unknown[]): Promise<T[]> => {
		const result = await client.query(text, params)
		return result.rows as T[]
	}

	return {
		query,
		queryOne: async <T>(text: string, params?: unknown[]) =>
			(await query<T>(text, params))[0] ?? null,
		close: () => client.end(),
	}
}

/** Runs `fn` with a request-scoped connection and always releases it. */
export const withDb = async <T>(
	env: Bindings | undefined,
	fn: (db: Db) => Promise<T>,
): Promise<T> => {
	const db = await openDb(env)
	try {
		return await fn(db)
	} finally {
		await db.close()
	}
}
