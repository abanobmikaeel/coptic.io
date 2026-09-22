import { describe, expect, it } from 'vitest'
import { app } from '../../index'

interface CelebrationResponse {
	id: number
	name: string
	type: string
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
