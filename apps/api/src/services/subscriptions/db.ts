import type { Bindings, D1Database } from '../../env'

export interface Db {
	query<T>(text: string, params?: unknown[]): Promise<T[]>
	queryOne<T>(text: string, params?: unknown[]): Promise<T | null>
}

/** Thrown when no database is configured, so routes can answer 503 instead of 500. */
export class DatabaseUnavailableError extends Error {
	constructor() {
		super('Subscriptions database is not configured')
	}
}

// SQLite has no boolean type. D1 would coerce on its own, but doing it here keeps the
// stored values the same wherever the adapter runs, including tests.
const toSqlite = (value: unknown): unknown => (typeof value === 'boolean' ? Number(value) : value)

/** Wraps a D1 binding. Statements use SQLite syntax with numbered `?N` parameters. */
export const d1Db = (database: D1Database): Db => {
	const query = async <T>(text: string, params: unknown[] = []): Promise<T[]> => {
		const { results } = await database
			.prepare(text)
			.bind(...params.map(toSqlite))
			.all<T>()
		return results
	}

	return {
		query,
		queryOne: async <T>(text: string, params?: unknown[]) =>
			(await query<T>(text, params))[0] ?? null,
	}
}

/** Runs `fn` against the subscriptions database, or throws when none is bound. */
export const withDb = async <T>(
	env: Bindings | undefined,
	fn: (db: Db) => Promise<T>,
): Promise<T> => {
	if (!env?.SUBSCRIPTIONS_DB) throw new DatabaseUnavailableError()
	return fn(d1Db(env.SUBSCRIPTIONS_DB))
}
