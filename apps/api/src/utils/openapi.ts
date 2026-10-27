import { OpenAPIHono, type RouteConfig } from '@hono/zod-openapi'
import type { Env } from 'hono'

/**
 * Create an OpenAPIHono app with a consistent validation-error envelope.
 * Without this, @hono/zod-validator returns the raw SafeParseResult shape,
 * which differs from the `{ error: string }` envelope used by hand-written
 * route errors and leaks schema internals to clients.
 */
export const createApiApp = <E extends Env = Env>() =>
	new OpenAPIHono<E>({
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

/**
 * OpenAPI has no optional path parameters, so a route like /readings/:date? is
 * documented as two operations, /readings and /readings/{date}. Given the route with
 * its final parameter, returns it without and with; register one handler for both.
 */
type WithoutParams<R extends RouteConfig> = Omit<R, 'request'> & {
	request: Omit<NonNullable<R['request']>, 'params'>
}

export const withOptionalLastParam = <R extends RouteConfig>(
	route: R,
): readonly [WithoutParams<R>, R] => {
	const { params: _params, ...request } = route.request ?? {}
	const bare = { ...route, path: route.path.replace(/\/\{\w+\}$/, '') || '/', request }
	// TypeScript cannot follow a rest destructure through a generic, hence the cast
	return [bare as WithoutParams<R>, route]
}
