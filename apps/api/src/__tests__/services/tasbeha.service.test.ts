import { describe, expect, it } from 'vitest'
import { app } from '../../index'
import { getSundayTasbeha } from '../../services/tasbeha.service'

describe('Tasbeha service', () => {
	it('returns aligned annual Sunday/Adam services', () => {
		const en = getSundayTasbeha('en', new Date(2026, 6, 27))
		const cop = getSundayTasbeha('cop', new Date(2026, 6, 27))
		const ar = getSundayTasbeha('ar', new Date(2026, 6, 27))

		expect(en.rite).toEqual({ cycle: 'annual', dayTune: 'adam', weekdays: [0] })
		expect(ar.sections.map(({ id }) => id)).toEqual(en.sections.map(({ id }) => id))
		expect(cop.sections.map(({ id }) => id)).toEqual(en.sections.map(({ id }) => id))
		expect(cop.sections[0].content[0]).toMatch(/[\u2c80-\u2cff]/i)
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

	it('serves Arabic through the REST route', async () => {
		const response = await app.request('/api/tasbeha/sunday?lang=ar&date=2026-07-27')
		expect(response.status).toBe(200)
		const service = await response.json()
		expect(service.type).toBe('tasbeha')
		expect(service.language).toBeUndefined()
		expect(service.name).toContain('تسبحة')
		expect(service.sections[0].content[0]).toMatch(/[\u0600-\u06ff]/)
	})

	it('serves Coptic through the REST route', async () => {
		const response = await app.request('/api/tasbeha/sunday?lang=cop&date=2026-07-27')
		expect(response.status).toBe(200)
		const service = await response.json()
		expect(service.sections[0].titleLanguage).toBe('en')
		expect(service.sections[0].content[0]).toMatch(/[\u2c80-\u2cff]/i)
	})
})
