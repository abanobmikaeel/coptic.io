import { OpenAPIHono } from '@hono/zod-openapi'

/**
 * Create an OpenAPIHono app with a consistent validation-error envelope.
 * Without this, @hono/zod-validator returns the raw SafeParseResult shape,
 * which differs from the `{ error: string }` envelope used by hand-written
 * route errors and leaks schema internals to clients.
 */
export const createApiApp = () =>
	new OpenAPIHono({
		defaultHook: (result, c) => {
			if (!result.success) {
				const message = result.error.issues
					.map((issue: { message: string }) => issue.message)
					.join(', ')
				return c.json({ error: message }, 400)
			}
			return undefined
		},
	})

/** An OpenAPI response whose body is JSON matching `schema`. */
export const jsonResponse = <T>(schema: T, description: string) => ({
	description,
	content: { 'application/json': { schema } },
})
