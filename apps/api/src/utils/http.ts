import type { Context } from 'hono'

/**
 * Generic message returned to clients when something unexpected fails. Internal
 * details (the real error message and stack) are logged server-side only.
 */
export const INTERNAL_ERROR_MESSAGE = 'Internal Server Error'

/**
 * Log an unexpected error with its scope and return a public-safe 500 envelope.
 * Use this from route catch blocks so internal error details never reach clients.
 */
export const internalError = (c: Context, scope: string, error: unknown): Response => {
	console.error(`Error in ${scope}:`, error)
	return c.json({ error: INTERNAL_ERROR_MESSAGE }, 500)
}
