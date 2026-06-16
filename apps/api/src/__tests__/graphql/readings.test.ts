import { describe, expect, it } from 'vitest'
import { app } from '../../index'

/**
 * Regression tests for the GraphQL readings query.
 *
 * The GraphQL schema had drifted from the REST data shape: detailed readings
 * exposed `chapter`/`verseNumber` (which never matched the resolver output, so
 * verse text always came back null), and `season`/`seasonDay`/`EP*` fields
 * were missing entirely. These tests lock the schema to the real data shape.
 */

const gql = async (query: string) => {
	const res = await app.request('/graphql', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ query }),
	})
	// biome-ignore lint/suspicious/noExplicitAny: test traverses arbitrary GraphQL response shapes
	return res.json() as Promise<{ data?: any; errors?: { message: string }[] }>
}

describe('GraphQL readings', () => {
	it('returns full verse text in detailed mode (chapters/verses/num/text)', async () => {
		const body = await gql(
			`{ readings(date: "2026-07-01", detailed: true) {
				Pauline { bookName chapters { chapterNum verses { num text } } }
			} }`,
		)

		expect(body.errors).toBeUndefined()
		const pauline = body.data.readings.Pauline
		expect(pauline[0].bookName).toBe('1 Corinthians')
		expect(pauline[0].chapters[0].chapterNum).toBeGreaterThan(0)
		expect(pauline[0].chapters[0].verses[0].num).toBeGreaterThan(0)
		expect(pauline[0].chapters[0].verses[0].text.length).toBeGreaterThan(0)
	})

	it('exposes season and seasonDay for a Lent date', async () => {
		const body = await gql(`{ readings(date: "2026-02-22") { season seasonDay } }`)

		expect(body.errors).toBeUndefined()
		expect(body.data.readings.season).toBe('Great Lent')
		expect(body.data.readings.seasonDay).toBe('Sunday of the first week of Great Lent')
	})

	it('exposes EPPsalm/EPGospel reference strings', async () => {
		const body = await gql(
			`{ readings(date: "2026-07-01") { reference { Pauline EPPsalm EPGospel } } }`,
		)

		expect(body.errors).toBeUndefined()
		expect(body.data.readings.reference.Pauline).toBeTruthy()
	})

	it('honours the lang argument for translated verse text', async () => {
		const body = await gql(
			`{ readings(date: "2026-07-01", detailed: true, lang: "ar") {
				VGospel { chapters { verses { text } } }
			} }`,
		)

		expect(body.errors).toBeUndefined()
		const text = body.data.readings.VGospel[0].chapters[0].verses[0].text
		// Arabic text contains Arabic-range characters.
		expect(/[؀-ۿ]/.test(text)).toBe(true)
	})
})
