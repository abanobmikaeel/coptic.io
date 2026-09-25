import { describe, expect, it } from 'vitest'
import { app } from '../../index'

interface CelebrationResponse {
	id: number
	name: string
	type: string
	category: string
	isMoveable?: boolean
	celebratedOnEve?: boolean
}

// Mesra 29, a Friday
const MONTHLY_COMMEMORATION = '2026-09-04'
// Kiahk 29, a Wednesday: the Nativity and the monthly commemoration on one day
const NATIVITY = '2026-01-07'
const THEOPHANY = '2026-01-19'
const EASTER = '2026-04-12'
const PALM_SUNDAY = '2026-04-05'

const getCelebrations = async (date: string): Promise<CelebrationResponse[]> => {
	const res = await app.request(`/api/celebrations/${date}`)
	expect(res.status).toBe(200)
	return res.json()
}

describe('the monthly commemoration on the 29th', () => {
	it('is a commemoration, not a feast of the Lord', async () => {
		expect(await getCelebrations(MONTHLY_COMMEMORATION)).toEqual([
			{
				id: 3,
				name: 'Annunciation, Nativity, and Resurrection',
				type: 'commemoration',
				category: 'commemoration',
				isMoveable: false,
			},
		])
	})

	it('does not lift the Wednesday/Friday fast', async () => {
		const res = await app.request(`/api/fasting/${MONTHLY_COMMEMORATION}`)
		const fasting = await res.json()

		expect(fasting).toMatchObject({ isFasting: true, description: 'Friday Fast' })
	})

	it('leaves the Nativity lifting the fast when both fall on a Wednesday', async () => {
		const res = await app.request(`/api/fasting/${NATIVITY}`)
		const fasting = await res.json()

		expect(fasting.isFasting).toBe(false)
	})

	it('is served the same way by /readings and GraphQL', async () => {
		const readings = await (await app.request(`/api/readings/${MONTHLY_COMMEMORATION}`)).json()
		expect(readings.celebrations[0].type).toBe('commemoration')

		const res = await app.request('/graphql', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				query: `{ celebrationsForDate(date: "${MONTHLY_COMMEMORATION}") { id type } }`,
			}),
		})
		const { data } = await res.json()
		expect(data.celebrationsForDate).toEqual([{ id: 3, type: 'commemoration' }])
	})
})

describe('feasts celebrated from their eve', () => {
	it.each([
		['the Nativity', NATIVITY, 7],
		['the Theophany', THEOPHANY, 9],
		['Easter', EASTER, 1006],
	])('marks %s', async (_name, date, id) => {
		const celebration = (await getCelebrations(date)).find((c) => c.id === id)

		expect(celebration?.celebratedOnEve).toBe(true)
	})

	it('leaves the flag off every other celebration', async () => {
		const res = await app.request('/api/celebrations')
		const all: CelebrationResponse[] = await res.json()
		const marked = all.filter((c) => c.celebratedOnEve).map((c) => c.id)

		expect(marked.sort()).toEqual([1006, 7, 9].sort())
		const palmSunday = (await getCelebrations(PALM_SUNDAY)).find((c) => c.id === 1003)
		expect(palmSunday).not.toHaveProperty('celebratedOnEve')
	})

	it('exposes the flag through GraphQL', async () => {
		const res = await app.request('/graphql', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				query: `{ celebrationsForDate(date: "${THEOPHANY}") { id celebratedOnEve } }`,
			}),
		})
		const { data } = await res.json()

		expect(data.celebrationsForDate).toContainEqual({ id: 9, celebratedOnEve: true })
	})
})
describe('celebration category', () => {
	// Annunciation, Nativity, Theophany, Palm Sunday, Easter, Ascension, Pentecost
	const MAJOR = [13, 7, 9, 1003, 1006, 1008, 1009]
	// Circumcision, Cana, Entrance into the Temple, Entry into Egypt, Transfiguration,
	// Holy Thursday, Thomas Sunday
	const MINOR = [19, 10, 11, 14, 17, 1004, 1007]
	// Nayrouz, the Cross, the Appearance of the Cross, the Apostles, St. Mary
	const OTHER = [1, 2, 12, 15, 18]

	const getAll = async (): Promise<CelebrationResponse[]> =>
		(await app.request('/api/celebrations')).json()
	const idsIn = (all: CelebrationResponse[], category: string) =>
		all
			.filter((c) => c.category === category)
			.map((c) => c.id)
			.sort()

	it('ranks the seven major and seven minor feasts of the Lord, fixed and moveable alike', async () => {
		const all = await getAll()

		expect(idsIn(all, 'majorFeast')).toEqual([...MAJOR].sort())
		expect(idsIn(all, 'minorFeast')).toEqual([...MINOR].sort())
		expect(idsIn(all, 'otherFeast')).toEqual([...OTHER].sort())
	})

	it('gives every celebration a known category', async () => {
		const known = ['majorFeast', 'minorFeast', 'otherFeast', 'fast', 'commemoration']

		for (const c of await getAll()) expect(known).toContain(c.category)
	})

	it.each([
		['the Nativity', '2027-01-07', 7],
		['the Annunciation', '2027-04-07', 13],
		['Easter', '2027-05-02', 1006],
	])('reports %s as a majorFeast on its date', async (_name, date, id) => {
		const celebration = (await getCelebrations(date)).find((c) => c.id === id)

		expect(celebration?.category).toBe('majorFeast')
	})

	it('leaves the deprecated type exactly as existing clients receive it', async () => {
		const legacy = Object.fromEntries((await getAll()).map((c) => [c.id, c.type]))

		expect(legacy).toEqual({
			1: 'feast',
			2: 'feast',
			3: 'commemoration',
			4: 'fast',
			5: 'fast',
			6: 'fast',
			7: 'feast',
			8: 'fast',
			9: 'feast',
			10: 'feast',
			11: 'feast',
			12: 'feast',
			13: 'lordlyFeast',
			14: 'feast',
			15: 'feast',
			16: 'fast',
			17: 'feast',
			18: 'feast',
			19: 'feast',
			1001: 'fast',
			1002: 'fast',
			1003: 'majorFeast',
			1004: 'minorFeast',
			1005: 'fast',
			1006: 'majorFeast',
			1007: 'minorFeast',
			1008: 'majorFeast',
			1009: 'majorFeast',
			1010: 'fast',
		})
	})

	it('is served by GraphQL, with type marked deprecated', async () => {
		const query = async (q: string) =>
			(
				await app.request('/graphql', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ query: q }),
				})
			).json()

		const { data } = await query('{ celebrationsForDate(date: "2027-01-07") { id type category } }')
		expect(data.celebrationsForDate).toContainEqual({
			id: 7,
			type: 'feast',
			category: 'majorFeast',
		})

		const schema = await query(
			'{ __type(name: "Celebration") { fields(includeDeprecated: true) { name isDeprecated } } }',
		)
		expect(schema.data.__type.fields).toContainEqual({ name: 'type', isDeprecated: true })
	})

	it('documents type as deprecated in the OpenAPI spec', async () => {
		const spec = await (await app.request('/openapi.json')).json()
		const celebration = JSON.stringify(spec)

		expect(celebration).toMatch(/"type":\{"type":"string","deprecated":true/)
		expect(celebration).toContain('"otherFeast"')
	})
})
