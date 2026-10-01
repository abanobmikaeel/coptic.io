import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { INTERNAL_ERROR_MESSAGE } from '../utils/http'
import { type ToolDefinition, tools } from './tools'

/** Serves a REST path in-process and returns its response. */
export type Dispatch = (path: string) => Promise<Response>

const INSTRUCTIONS =
	'Coptic Orthodox Church data from coptic.io: the Coptic calendar, Katameros readings, fasts, feasts, liturgical seasons, the Synaxarium and the Agpeya. Dates are Gregorian YYYY-MM-DD. Quote liturgical and Scriptural text as returned; do not paraphrase it as the source.'

const text = (value: string, isError = false): CallToolResult => ({
	content: [{ type: 'text', text: value }],
	...(isError ? { isError: true } : {}),
})

/** Route errors carry a public-safe `{ error }` envelope; surface it to the model. */
const errorMessage = async (res: Response): Promise<string> => {
	const body = (await res.json().catch(() => null)) as { error?: unknown } | null
	return typeof body?.error === 'string' ? body.error : INTERNAL_ERROR_MESSAGE
}

export const callTool = async (
	definition: ToolDefinition,
	args: Record<string, unknown>,
	dispatch: Dispatch,
): Promise<CallToolResult> => {
	const res = await dispatch(definition.path(args))
	if (!res.ok) return text(await errorMessage(res), true)
	const body = await res.json()
	return text(JSON.stringify(definition.select ? definition.select(body) : body))
}

export const createMcpServer = (dispatch: Dispatch): McpServer => {
	const server = new McpServer(
		{ name: 'coptic.io', version: '1.0.0' },
		{ instructions: INSTRUCTIONS },
	)
	for (const definition of tools) {
		server.registerTool(
			definition.name,
			{
				title: definition.title,
				description: definition.description,
				inputSchema: definition.inputSchema,
				annotations: { readOnlyHint: true, openWorldHint: false },
			},
			(args) => callTool(definition, args as Record<string, unknown>, dispatch),
		)
	}
	return server
}

/**
 * Handle one MCP Streamable HTTP request. The server is stateless: every tool is
 * a read, so no session is kept and each request gets its own server, which is
 * what a Worker isolate can safely hold.
 */
export const handleMcpRequest = async (request: Request, dispatch: Dispatch): Promise<Response> => {
	const transport = new WebStandardStreamableHTTPServerTransport({
		sessionIdGenerator: undefined,
		enableJsonResponse: true,
	})
	const server = createMcpServer(dispatch)
	await server.connect(transport)
	return transport.handleRequest(request)
}
