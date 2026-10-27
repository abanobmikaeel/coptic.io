import { describe, expect, it } from 'vitest'
import { app } from '../../index'

const gql = (query: string) =>
	app.request('/graphql', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ query }),
	})

const FIELDS = `reference { VPsalm LGospel Pauline } season seasonKey seasonDay cycle
	readingsAvailable fullDate { monthString day }`

describe('GraphQL readings', () => {
	// An annual weekday, a Sunday, a Holy Fifty day and a Holy Week day, in an LTR and an RTL language
	it.each([
		['2026-10-27', 'en'],
		['2026-11-01', 'ar'],
		['2026-04-20', 'en'],
		['2026-04-08', 'ar'],
	])('matches the REST readings for %s in %s', async (date, lang) => {
		const [gqlRes, restRes] = await Promise.all([
			gql(`{ readings(date: "${date}", lang: "${lang}") { ${FIELDS} } }`),
			app.request(`/api/readings/${date}?lang=${lang}`),
		])
		const { data } = (await gqlRes.json()) as { data: { readings: Record<string, unknown> } }
		const rest = (await restRes.json()) as Record<string, unknown>
		const restReference = rest.reference as Record<string, unknown> | undefined

		expect(data.readings).toEqual({
			reference: restReference
				? {
						VPsalm: restReference.VPsalm ?? null,
						LGospel: restReference.LGospel ?? null,
						Pauline: restReference.Pauline ?? null,
					}
				: null,
			season: rest.season ?? null,
			seasonKey: rest.seasonKey ?? null,
			seasonDay: rest.seasonDay ?? null,
			cycle: rest.cycle,
			readingsAvailable: rest.readingsAvailable,
			fullDate: {
				monthString: (rest.fullDate as { monthString: string }).monthString,
				day: (rest.fullDate as { day: number }).day,
			},
		})
	})
})
