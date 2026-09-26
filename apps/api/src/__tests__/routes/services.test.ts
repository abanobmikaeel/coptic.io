import { describe, expect, it } from 'vitest'
import { app } from '../../index'

interface Section {
	id: string
	type: string
	title?: string
	rubric?: string
	optional?: boolean
	reference?: string
	content?: string[]
	verses?: { num: number; text: string }[]
}
interface Service {
	date: string
	sections: Section[]
}

const get = async <T>(path: string, status = 200): Promise<T> => {
	const res = await app.request(path)
	expect(res.status, path).toBe(status)
	return res.json() as Promise<T>
}

const ARABIC = /[؀-ۿ]/
const COPTIC = /[Ⲁ-⳿Ϣ-ϯ]/
const DATE = '2026-09-26'
const section = (service: Service, id: string) => service.sections.find((s) => s.id === id)

describe('GET /api/incense/:service', () => {
	it('fills the Vespers gospel and daily psalm from the day’s Katameros', async () => {
		const vespers = await get<Service>(`/api/incense/evening?date=${DATE}`)
		const gospel = vespers.sections.find((s) => s.type === 'gospel')
		expect(gospel?.reference).toBe('Luke 7:1-10')
		expect(gospel?.verses?.length).toBeGreaterThan(0)
		expect(vespers.date).toBe(DATE)
	})

	it('reads a different gospel at Matins than at Vespers on the same day', async () => {
		const vespers = await get<Service>(`/api/incense/evening?date=${DATE}`)
		const matins = await get<Service>(`/api/incense/morning?date=${DATE}`)
		const gospel = (s: Service) => s.sections.find((x) => x.type === 'gospel')?.reference
		expect(gospel(matins)).toBe('Luke 19:1-10')
		expect(gospel(matins)).not.toBe(gospel(vespers))
	})

	it('offers the out-of-season nature litanies as optional, labelled sections', async () => {
		const vespers = await get<Service>(`/api/incense/evening?date=${DATE}`)
		const outOfSeason = vespers.sections.filter((s) => s.id.startsWith('litany-nature-'))
		expect(outOfSeason.length).toBeGreaterThan(0)
		for (const s of outOfSeason) {
			expect(s.optional, s.id).toBe(true)
			expect(s.rubric, s.id).toBe('Out of season.')
		}
	})

	it('adds a selected commemoration’s verses to the service', async () => {
		const { commemorations } = await get<{ commemorations: string[] }>(
			'/api/incense/commemorations',
		)
		expect(commemorations).toContain('martyrs')

		const plain = await get<Service>(`/api/incense/evening?date=${DATE}`)
		const withMartyrs = await get<Service>(
			`/api/incense/evening?date=${DATE}&commemorations=martyrs`,
		)
		const cymbals = (s: Service) => section(s, 'verses-of-cymbals')?.content ?? []
		expect(cymbals(withMartyrs).length).toBeGreaterThan(cymbals(plain).length)
	})

	it.each([
		['ar', ARABIC],
		['cop', COPTIC],
	])('serves the %s text', async (lang, script) => {
		const vespers = await get<Service>(`/api/incense/evening?date=${DATE}&lang=${lang}`)
		const prose = vespers.sections.flatMap((s) => s.content ?? []).join(' ')
		expect(prose).toMatch(script)
	})

	it('rejects a malformed date', async () => {
		await get('/api/incense/evening?date=bad', 400)
	})
})

describe('GET /api/liturgy/basil', () => {
	it('fills every reading section with verses for the requested date', async () => {
		const basil = await get<Service>('/api/liturgy/basil?date=2026-09-27')
		for (const id of ['pauline', 'catholic', 'praxis', 'daily-psalm', 'gospel']) {
			expect(section(basil, id)?.verses?.length, id).toBeGreaterThan(0)
		}
		expect(section(basil, 'gospel')?.reference).toBe('John 10:22-38')
	})

	it.each([
		['ar', ARABIC],
		['cop', COPTIC],
	])('resolves the gospel in %s', async (lang, script) => {
		const basil = await get<Service>(`/api/liturgy/basil?date=2026-09-27&lang=${lang}`)
		expect(section(basil, 'gospel')?.verses?.[0]?.text).toMatch(script)
	})

	it('keeps the same section order in every language', async () => {
		const ids = async (lang: string) =>
			(await get<Service>(`/api/liturgy/basil?date=2026-09-27&lang=${lang}`)).sections.map(
				(s) => s.id,
			)
		const en = await ids('en')
		expect(await ids('ar')).toEqual(en)
		expect(await ids('cop')).toEqual(en)
	})

	it('rejects a malformed date', async () => {
		await get('/api/liturgy/basil?date=2026-13-40', 400)
	})
})

describe('GET /api/lent', () => {
	it('schedules Great Lent from the Monday 55 days before Easter to Palm Sunday', async () => {
		const schedule = await get<{
			easterDate: string
			lentStart: string
			lentEnd: string
			days: { dayNumber: number }[]
		}>('/api/lent/schedule/2026')
		expect(schedule).toMatchObject({
			easterDate: '2026-04-12',
			lentStart: '2026-02-16',
			lentEnd: '2026-04-05',
		})
		expect(schedule.days[0].dayNumber).toBe(1)
	})

	it('returns the devotional for a day of Lent', async () => {
		const day = await get<{ dayNumber: number; title: string; references: string[] }>(
			'/api/lent/2026-03-10',
		)
		expect(day.dayNumber).toBe(23)
		expect(day.references).toEqual(['Luke 9:57-62'])
	})

	it('resolves the references only when detailed=true', async () => {
		const plain = await get<Record<string, unknown>>('/api/lent/2026-03-10')
		const detailed = await get<Record<string, unknown>>('/api/lent/2026-03-10?detailed=true')
		expect(plain).not.toHaveProperty('resolvedReferences')
		expect(detailed).toHaveProperty('resolvedReferences')
	})

	it('answers 404 outside Great Lent and 400 for bad input', async () => {
		await get('/api/lent/2026-09-26', 404)
		await get('/api/lent/not-a-date', 400)
		await get('/api/lent/schedule/abc', 400)
	})
})
