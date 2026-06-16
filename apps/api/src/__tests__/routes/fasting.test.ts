import { describe, expect, it } from 'vitest'
import { app } from '../../index'
import { getFastingForDate } from '../../services/fasting.service'
import { parseLocalDate } from '../../utils/dateUtils'

/**
 * Route-level tests for /api/fasting/:date.
 *
 * The route previously parsed the date with `new Date("YYYY-MM-DD")`, which
 * interprets the string as UTC midnight and shifts the day in timezones behind
 * UTC. It now uses parseLocalDate, matching the other date-based routes.
 */

describe('GET /api/fasting/:date', () => {
	it('parses the date as a local day (no UTC shift)', async () => {
		const date = '2025-03-15' // within Great Lent
		const res = await app.request(`/api/fasting/${date}`)
		expect(res.status).toBe(200)

		const json = (await res.json()) as { isFasting: boolean }
		// Must match the service computed from the same local calendar day.
		const expected = getFastingForDate(parseLocalDate(date)!)
		expect(json.isFasting).toBe(expected.isFasting)
	})

	it('returns 400 for a malformed date', async () => {
		const res = await app.request('/api/fasting/not-a-date')
		expect(res.status).toBe(400)
	})

	it('defaults to today when no date is provided', async () => {
		const res = await app.request('/api/fasting')
		expect(res.status).toBe(200)
		const json = (await res.json()) as { isFasting: boolean }
		expect(typeof json.isFasting).toBe('boolean')
	})
})
