import { describe, expect, it } from 'vitest'
import { app } from '../../index'

const gql = (query: string) =>
	app.request('/graphql', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ query }),
	})

const FIELDS = `verse { book chapter verse text } reference readingSlot readingReference
	language requestedLanguage fallback fullDate { monthString day }`

describe('GraphQL dailyVerse', () => {
	it.each(['en', 'ar', 'cop'])('matches the REST verse for the same date in %s', async (lang) => {
		const [gqlRes, restRes] = await Promise.all([
			gql(`{ dailyVerse(date: "2026-05-20", lang: "${lang}") { ${FIELDS} } }`),
			app.request(`/api/verse/2026-05-20?lang=${lang}`),
		])
		const { data } = (await gqlRes.json()) as { data: { dailyVerse: Record<string, unknown> } }
		const rest = (await restRes.json()) as Record<string, unknown>

		expect(data.dailyVerse.reference).toBe(rest.reference)
		expect(data.dailyVerse.verse).toEqual(rest.verse)
		expect(data.dailyVerse.language).toBe(rest.language)
		expect(data.dailyVerse.fallback ?? undefined).toBe(rest.fallback)
		expect(data.dailyVerse.requestedLanguage ?? undefined).toBe(rest.requestedLanguage)
	})

	it('resolves the localized Coptic date', async () => {
		const res = await gql(`{ dailyVerse(date: "2026-05-20") { fullDate { monthString day } } }`)
		const { data } = (await res.json()) as {
			data: { dailyVerse: { fullDate: { monthString: string; day: number } } }
		}
		expect(data.dailyVerse.fullDate).toEqual({ monthString: 'Bashans', day: 12 })
	})

	it('surfaces an invalid date as a GraphQL error', async () => {
		const res = await gql(`{ dailyVerse(date: "2026-02-30") { reference } }`)
		const body = (await res.json()) as { data?: { dailyVerse: unknown }; errors?: unknown[] }
		expect(body.errors).toBeDefined()
		expect(body.data?.dailyVerse ?? null).toBeNull()
	})
})
