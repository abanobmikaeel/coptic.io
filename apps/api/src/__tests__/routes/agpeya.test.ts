import { afterEach, describe, expect, it, vi } from 'vitest'
import { app } from '../../index'

interface Block {
	id?: string
	title?: string
	content: string[]
}
interface Psalm {
	title: string
	verses: { num: number; text: string }[]
}
interface Hour {
	id: string
	name: string
	psalms?: Psalm[]
	gospel?: { reference: string; verses: unknown[] }
	litanies?: Block
	closing?: Block
	conclusion?: Block[]
	watches?: { id: string; psalms: Psalm[] }[]
}

const get = async <T>(path: string, status = 200): Promise<T> => {
	const res = await app.request(path)
	expect(res.status, path).toBe(status)
	return res.json() as Promise<T>
}

const ARABIC = /[؀-ۿ]/
const COPTIC = /[Ⲁ-⳿Ϣ-ϯ]/

describe('GET /api/agpeya/hours', () => {
	it('lists the seven hours in prayed order', async () => {
		const hours = await get<Hour[]>('/api/agpeya/hours')
		expect(hours.map((h) => h.id)).toEqual([
			'prime',
			'terce',
			'sext',
			'none',
			'vespers',
			'compline',
			'midnight',
		])
	})

	it('serves Arabic prose for lang=ar', async () => {
		const hours = await get<Hour[]>('/api/agpeya/hours?lang=ar')
		for (const hour of hours) expect(hour.name, hour.id).toMatch(ARABIC)
	})
})

describe('GET /api/agpeya/:hour', () => {
	it.each(['en', 'ar'])('ends terce with the concluding sequence (%s)', async (lang) => {
		const terce = await get<Hour>(`/api/agpeya/terce?lang=${lang}`)
		expect(terce.conclusion?.map((s) => s.id)).toEqual([
			'kyrie41',
			'holy-holy-holy',
			'terce-absolution',
			'conclusion-of-every-hour',
		])
		expect(terce.closing).toBeUndefined()
	})

	it('resolves a gospel with verses', async () => {
		const sext = await get<Hour>('/api/agpeya/sext')
		expect(sext.gospel?.reference).toBeTruthy()
		expect(sext.gospel?.verses.length).toBeGreaterThan(0)
	})

	it('serves the liturgical psalter by default and the Bible when asked', async () => {
		const liturgical = await get<Hour>('/api/agpeya/terce')
		const bible = await get<Hour>('/api/agpeya/terce?psalms=bible')

		expect(liturgical.psalms?.length).toBe(bible.psalms?.length)
		const text = (h: Hour) => h.psalms?.flatMap((p) => p.verses.map((v) => v.text)).join(' ')
		expect(text(liturgical)).not.toBe(text(bible))
	})

	it('resolves Coptic psalms from the Coptic Bible, never the embedded English psalter', async () => {
		const coptic = await get<Hour>('/api/agpeya/terce?lang=cop')
		const verses = coptic.psalms?.flatMap((p) => p.verses) ?? []
		expect(verses.length).toBeGreaterThan(0)
		expect(verses.some((v) => COPTIC.test(v.text))).toBe(true)
	})

	it('returns midnight with its three watches', async () => {
		const midnight = await get<Hour>('/api/agpeya/midnight')
		expect(midnight.watches?.map((w) => w.id)).toEqual(['midnight-1', 'midnight-2', 'midnight-3'])
	})

	it('rejects an unknown hour', async () => {
		const res = await app.request('/api/agpeya/lauds')
		expect(res.status).toBeGreaterThanOrEqual(400)
		expect(res.status).toBeLessThan(500)
	})
})

describe('GET /api/agpeya/midnight/watch/:watch', () => {
	it('returns a single watch with its psalms', async () => {
		const watch = await get<{ id: string; psalms: Psalm[] }>('/api/agpeya/midnight/watch/2')
		expect(watch.id).toBe('midnight-2')
		expect(watch.psalms.length).toBeGreaterThan(0)
	})

	it('rejects a watch that does not exist', async () => {
		const res = await app.request('/api/agpeya/midnight/watch/4')
		expect(res.status).toBeGreaterThanOrEqual(400)
		expect(res.status).toBeLessThan(500)
	})
})

describe('GET /api/agpeya/translations', () => {
	it('offers English and Arabic prose and Coptic scripture, but not Spanish', async () => {
		const { available } = await get<{ available: string[] }>('/api/agpeya/translations')
		expect(available).toEqual(['en', 'ar', 'cop'])
	})
})

describe('GET /api/agpeya (current hour)', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	// Documents current behaviour: the hour comes from the server's local clock,
	// which on Workers is UTC rather than the reader's time zone
	it.each([
		[3, 'midnight'],
		[7, 'prime'],
		[10, 'terce'],
		[13, 'sext'],
		[16, 'none'],
		[19, 'vespers'],
		[22, 'compline'],
	])('at %i:00 server time returns %s', async (hour, expected) => {
		vi.useFakeTimers({ toFake: ['Date'] })
		vi.setSystemTime(new Date(2026, 8, 26, hour, 30))
		const current = await get<Hour>('/api/agpeya')
		expect(current.id).toBe(expected)
	})
})
