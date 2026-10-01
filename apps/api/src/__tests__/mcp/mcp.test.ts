import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../index'
import { callTool } from '../../mcp/server'
import { toPath, tools } from '../../mcp/tools'
import { INVALID_DATE_MESSAGE } from '../../utils/dateUtils'
import { INTERNAL_ERROR_MESSAGE } from '../../utils/http'

const client = new Client({ name: 'test', version: '1.0.0' })

const call = async (name: string, args: Record<string, unknown> = {}) => {
	const result = await client.callTool({ name, arguments: args })
	const [first] = result.content as { type: string; text: string }[]
	return { isError: result.isError === true, text: first?.text ?? '' }
}

const rest = async (path: string) => (await app.request(path)).json()

beforeAll(async () => {
	const transport = new StreamableHTTPClientTransport(new URL('http://localhost/mcp'), {
		fetch: (input, init) => app.request(new Request(input, init)),
	})
	await client.connect(transport)
})

afterAll(() => client.close())

describe('MCP endpoint', () => {
	it('advertises its tools as read-only', async () => {
		const { tools } = await client.listTools()
		expect(tools.map((t) => t.name)).toEqual(
			expect.arrayContaining([
				'get_coptic_date',
				'get_daily_readings',
				'get_agpeya_hour',
				'search',
			]),
		)
		for (const t of tools) expect(t.annotations?.readOnlyHint).toBe(true)
	})

	// One working call per tool, so a tool whose path no route answers cannot ship.
	const samples: Record<string, Record<string, unknown>> = {
		get_coptic_date: {},
		get_calendar_month: { year: 2026, month: 4 },
		get_daily_readings: { date: '2026-04-12' },
		get_fasting: { date: '2026-03-04', lang: 'ar' },
		get_fasting_calendar: { year: 2026 },
		get_liturgical_season: { date: '2026-03-04', lang: 'es' },
		get_fasting_periods: { year: 2026 },
		get_celebrations: { date: '2026-01-07' },
		get_upcoming_celebrations: { days: 60, lang: 'ar' },
		get_synaxarium: { date: '2026-01-07', lang: 'ar', includeText: true },
		search_synaxarium: { query: 'Mary' },
		get_agpeya_hour: { hour: 'prime' },
		get_midnight_watch: { watch: '3', lang: 'ar' },
		search: { query: 'Antony' },
	}

	it('has a sample call for every tool', async () => {
		const { tools } = await client.listTools()
		expect(tools.map((t) => t.name).sort()).toEqual(Object.keys(samples).sort())
	})

	it.each(Object.entries(samples))('answers %s', async (name, args) => {
		const { isError, text } = await call(name, args)
		expect(isError, text).toBe(false)
		expect(JSON.parse(text)).toBeTruthy()
	})

	it('returns server instructions on initialize', () => {
		expect(client.getInstructions()).toContain('coptic.io')
	})

	it('answers a tool with the same data as the REST route', async () => {
		const { isError, text } = await call('get_coptic_date', { date: '2025-09-11', lang: 'ar' })
		expect(isError).toBe(false)
		expect(JSON.parse(text)).toEqual(await rest('/api/calendar/2025-09-11?lang=ar'))
	})

	it('passes language and full text through to readings', async () => {
		const { text } = await call('get_daily_readings', {
			date: '2025-04-20',
			lang: 'ar',
			includeText: true,
		})
		expect(JSON.parse(text)).toEqual(await rest('/api/readings/2025-04-20?lang=ar&detailed=true'))
	})

	it('returns the route error as a tool error for an impossible date', async () => {
		const result = await call('get_fasting', { date: '2025-02-30' })
		expect(result).toEqual({ isError: true, text: INVALID_DATE_MESSAGE })
	})

	it('rejects arguments outside the tool schema', async () => {
		const result = await call('get_agpeya_hour', { hour: 'midnight' })
		expect(result.isError).toBe(true)
	})

	it('serves an Agpeya hour once, in prayed order', async () => {
		const { text } = await call('get_agpeya_hour', { hour: 'terce', lang: 'ar' })
		const hour = await rest('/api/agpeya/terce?lang=ar&include=sections')
		expect(JSON.parse(text)).toEqual({
			id: 'terce',
			name: hour.name,
			englishName: hour.englishName,
			traditionalTime: hour.traditionalTime,
			introduction: hour.introduction,
			sections: hour.sections,
		})
	})

	it('serves the Midnight hour one watch at a time', async () => {
		const { text } = await call('get_midnight_watch', { watch: '2', lang: 'en' })
		expect(JSON.parse(text)).toEqual(await rest('/api/agpeya/midnight/watch/2?lang=en'))
	})

	it('maps search categories onto the REST query', async () => {
		const { text } = await call('search', { query: 'John 3:16', categories: ['bible'], limit: 1 })
		const json = JSON.parse(text)
		expect(json).toEqual(await rest('/api/search?q=John+3%3A16&categories=bible&limit=1'))
		expect(json.results.synaxarium).toEqual([])
	})
})

describe('callTool', () => {
	it('never passes a non-envelope error body through to the model', async () => {
		const [definition] = tools
		const dispatch = async () => new Response('TypeError: secret stack', { status: 500 })
		const result = await callTool(definition as (typeof tools)[number], {}, dispatch)
		expect(result).toEqual({
			content: [{ type: 'text', text: INTERNAL_ERROR_MESSAGE }],
			isError: true,
		})
	})
})

describe('toPath', () => {
	it('drops unset query parameters', () => {
		expect(toPath('/api/x', { a: 'ar', b: undefined, c: 2 })).toBe('/api/x?a=ar&c=2')
		expect(toPath('/api/x', { a: undefined })).toBe('/api/x')
	})
})
