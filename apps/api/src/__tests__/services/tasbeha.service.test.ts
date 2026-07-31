import { describe, expect, it } from 'vitest'
import { app } from '../../index'
import { getSundayTasbeha, getTasbehaById, getTasbehaForDate } from '../../services/tasbeha.service'

// 2026-07-26 is a Sunday, so offsets from it walk the week in order.
const SUNDAY = new Date(2026, 6, 26)
const MONDAY = new Date(2026, 6, 27)
const SATURDAY = new Date(2026, 7, 1)

describe('Tasbeha service', () => {
	it('returns aligned annual Sunday/Adam services', () => {
		const en = getSundayTasbeha('en', MONDAY)
		const cop = getSundayTasbeha('cop', MONDAY)
		const ar = getSundayTasbeha('ar', MONDAY)

		expect(en.rite).toEqual({ cycle: 'annual', dayTune: 'adam', weekdays: [0] })
		expect(ar.sections.map(({ id }) => id)).toEqual(en.sections.map(({ id }) => id))
		expect(cop.sections.map(({ id }) => id)).toEqual(en.sections.map(({ id }) => id))
		expect(cop.sections[0].content[0]).toMatch(/[Ⲁ-⳿]/i)
		expect(cop.sections[0].titleLanguage).toBe('en')
		expect(en.sections.every(({ content }) => content.every((line) => !/^\s*\+/.test(line)))).toBe(
			true,
		)
	})

	it('resolves the date-limited final Sunday Theotokia parts', () => {
		const beforeResurrection = getSundayTasbeha('en', new Date(2025, 3, 19))
		const resurrection = getSundayTasbeha('en', new Date(2025, 3, 20))

		expect(beforeResurrection.sections.some(({ id }) => id === 'sunday-theotokia-part-16')).toBe(
			false,
		)
		expect(resurrection.sections.some(({ id }) => id === 'sunday-theotokia-part-16')).toBe(true)
	})

	it("resolves a date to its own weekday's service", () => {
		expect(getTasbehaForDate(SUNDAY).id).toBe('sunday-midnight-praises')
		expect(getTasbehaForDate(MONDAY).id).toBe('monday-midnight-praises')
		expect(getTasbehaForDate(SATURDAY).id).toBe('saturday-vespers-praises')
	})

	it('gives every weekday a complete service in all three languages', () => {
		for (let offset = 0; offset < 7; offset++) {
			const date = new Date(2026, 6, 26 + offset)
			const en = getTasbehaForDate(date, 'en')
			const ar = getTasbehaForDate(date, 'ar')
			const cop = getTasbehaForDate(date, 'cop')

			expect(en.rite.weekdays, en.id).toContain(date.getDay())
			expect(en.status).toBe('complete')
			expect(en.sections.length).toBeGreaterThan(0)
			expect(
				ar.sections.map(({ id }) => id),
				en.id,
			).toEqual(en.sections.map(({ id }) => id))
			expect(
				cop.sections.map(({ id }) => id),
				en.id,
			).toEqual(en.sections.map(({ id }) => id))
		}
	})

	it("matches the calendar's Adam/Watos tune for every weekday", () => {
		for (let offset = 0; offset < 7; offset++) {
			const date = new Date(2026, 6, 26 + offset)
			const expected = date.getDay() <= 2 ? 'adam' : 'watos'
			expect(getTasbehaForDate(date).rite.dayTune, `weekday ${date.getDay()}`).toBe(expected)
		}
	})

	it('swaps in the proper psali and Theotokia per weekday', () => {
		const monday = getTasbehaById('monday-midnight-praises')
		const wednesday = getTasbehaById('wednesday-midnight-praises')

		expect(monday.sections.map(({ id }) => id)).toEqual(
			expect.arrayContaining(['monday-psali', 'monday-theotokia', 'monday-theotokia-lobsh']),
		)
		expect(monday.sections.map(({ id }) => id)).toContain('theotokia-introduction-leebon')
		expect(monday.sections.map(({ id }) => id)).not.toContain('first-sunday-psali')
		expect(wednesday.sections.map(({ id }) => id)).toEqual(
			expect.arrayContaining([
				'wednesday-psali',
				'wednesday-theotokia',
				'wednesday-theotokia-ti-galilia',
				'watos-theotokias-introduction',
			]),
		)
	})

	it('serves Saturday as a Vespers Praise', () => {
		const saturday = getTasbehaById('saturday-vespers-praises')
		const ids = saturday.sections.map(({ id }) => id)

		expect(ids[0]).toBe('saturday-ni-ethnos-teero')
		expect(ids).toContain('saturday-theotokia-lobsh-sherat')
		expect(ids).not.toContain('morning-doxology')
		expect(saturday.rite.dayTune).toBe('watos')
	})

	it('serves Arabic through the REST route', async () => {
		const response = await app.request('/api/tasbeha/sunday?lang=ar&date=2026-07-27')
		expect(response.status).toBe(200)
		const service = await response.json()
		expect(service.type).toBe('tasbeha')
		expect(service.language).toBeUndefined()
		expect(service.name).toContain('تسبحة')
		expect(service.sections[0].content[0]).toMatch(/[؀-ۿ]/)
	})

	it('serves Coptic through the REST route', async () => {
		const response = await app.request('/api/tasbeha/sunday?lang=cop&date=2026-07-27')
		expect(response.status).toBe(200)
		const service = await response.json()
		expect(service.sections[0].titleLanguage).toBe('en')
		expect(service.sections[0].content[0]).toMatch(/[Ⲁ-⳿]/i)
	})

	it("resolves the date's weekday at the collection route", async () => {
		const response = await app.request('/api/tasbeha?date=2026-07-29')
		expect(response.status).toBe(200)
		const service = await response.json()
		expect(service.id).toBe('wednesday-midnight-praises')
		expect(service.rite.dayTune).toBe('watos')
	})

	it('serves a named day regardless of today', async () => {
		const response = await app.request('/api/tasbeha/thursday?lang=en')
		expect(response.status).toBe(200)
		const service = await response.json()
		expect(service.id).toBe('thursday-midnight-praises')
		expect(service.sections.map((section: { id: string }) => section.id)).toContain(
			'thursday-theotokia',
		)
	})

	it('keeps /sunday matching ahead of the day parameter', async () => {
		const [named, explicit] = await Promise.all([
			app.request('/api/tasbeha/sunday?date=2026-07-27'),
			app.request('/api/tasbeha/monday?date=2026-07-27'),
		])
		expect((await named.json()).id).toBe('sunday-midnight-praises')
		expect((await explicit.json()).id).toBe('monday-midnight-praises')
	})

	it('documents every Tasbeha route in the OpenAPI spec', async () => {
		const response = await app.request('/openapi.json')
		expect(response.status).toBe(200)
		const doc = await response.json()
		const paths = Object.keys(doc.paths).filter((path) => path.includes('tasbeha'))
		expect(paths).toEqual(
			expect.arrayContaining(['/api/tasbeha', '/api/tasbeha/sunday', '/api/tasbeha/{day}']),
		)
	})

	it('rejects an unknown day and an invalid date', async () => {
		const [badDay, badDate] = await Promise.all([
			app.request('/api/tasbeha/octoday'),
			app.request('/api/tasbeha?date=not-a-date'),
		])
		expect(badDay.status).toBe(400)
		expect(badDate.status).toBe(400)
	})
})
