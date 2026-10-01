import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type { Usage } from '../analytics/record'
import { INTERNAL_ERROR_MESSAGE } from '../utils/http'
import { type ToolDefinition, tools } from './tools'

/** Serves a REST path in-process and returns its response. */
export type Dispatch = (path: string) => Promise<Response>

/** Receives one usage event per tool call and per initialize handshake. */
export type OnUsage = (usage: Usage) => void

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

export const createMcpServer = (dispatch: Dispatch, onUsage: OnUsage = () => {}): McpServer => {
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
			async (args) => {
				const started = Date.now()
				const result = await callTool(definition, args as Record<string, unknown>, dispatch)
				onUsage({
					kind: 'mcp',
					route: `tool:${definition.name}`,
					status: result.isError ? 'error' : 'ok',
					durationMs: Date.now() - started,
				})
				return result
			},
		)
	}
	return server
}

/**
 * Handle one MCP Streamable HTTP request. The server is stateless: every tool is
 * a read, so no session is kept and each request gets its own server, which is
 * what a Worker isolate can safely hold.
 */
export const handleMcpRequest = async (
	request: Request,
	dispatch: Dispatch,
	onUsage: OnUsage = () => {},
): Promise<Response> => {
	const started = Date.now()
	const transport = new WebStandardStreamableHTTPServerTransport({
		sessionIdGenerator: undefined,
		enableJsonResponse: true,
	})
	const server = createMcpServer(dispatch, onUsage)
	await server.connect(transport)
	const response = await transport.handleRequest(request)
	// Stateless, so the client names itself only on the request that initializes.
	const client = server.server.getClientVersion()
	if (client) {
		onUsage({
			kind: 'mcp',
			route: 'initialize',
			status: String(response.status),
			durationMs: Date.now() - started,
			mcpClient: `${client.name}/${client.version}`,
		})
	}
	return response
}
