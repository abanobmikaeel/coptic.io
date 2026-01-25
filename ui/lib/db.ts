import { Pool } from 'pg'

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
	const result = await pool.query(text, params)
	return result.rows as T[]
}

export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
	const rows = await query<T>(text, params)
	return rows[0] || null
}

export { pool }
