import { describe, expect, it } from 'vitest'
import { app } from '../../index'

const gql = (query: string) =>
	app.request('/graphql', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ query }),
	})

describe('GraphQL date parsing', () => {
	// Regression: GraphQL resolvers previously used `new Date(dateString)`, which
	// parses YYYY-MM-DD as UTC and shifts the day in negative-offset timezones.
	// They must parse the same way as REST so both surfaces agree on the day.
	it('parses YYYY-MM-DD as local time, matching the REST /calendar result', async () => {
		// 2025-01-15 -> Toba 7, 1741 (the value asserted in the REST calendar tests).
		const res = await gql(`{ copticDate(date: "2025-01-15") { day month year } }`)
		expect(res.status).toBe(200)

		const { data } = (await res.json()) as {
			data: { copticDate: { day: number; month: number; year: number } }
		}
		expect(data.copticDate.day).toBe(7)
		expect(data.copticDate.month).toBe(5)
		expect(data.copticDate.year).toBe(1741)
	})

	it('surfaces invalid dates as a GraphQL error instead of silently shifting the day', async () => {
		const res = await gql(`{ copticDate(date: "not-a-date") { day } }`)
		const body = (await res.json()) as { errors?: unknown[] }
		expect(body.errors).toBeDefined()
	})
})
