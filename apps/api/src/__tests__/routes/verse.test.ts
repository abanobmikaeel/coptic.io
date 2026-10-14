import { describe, expect, it } from 'vitest'
import { app } from '../../index'
import featuredVerses from '../../resources/featuredVerses.json'

describe('GET /api/verse', () => {
	it('returns the daily verse for a fixed date', async () => {
		const res = await app.request('/api/verse/2026-05-20') // Bashans 12, reading id 18
		expect(res.status).toBe(200)

		const json = await res.json()
		const entry = featuredVerses.fixed['18']
		expect(json.reference).toBe(entry.reference)
		expect(json.readingSlot).toBe(entry.slot)
		expect(json.readingReference).toBe(entry.reading)
		expect(`${json.verse.book} ${json.verse.chapter}:${json.verse.verse}`).toBe(entry.reference)
		expect(json.verse.text).toBeTruthy()
		expect(json.fullDate.monthString).toBe('Bashans')
	})

	it('returns the verse in the requested translation', async () => {
		const res = await app.request('/api/verse/2026-05-20?lang=ar')
		expect(res.status).toBe(200)

		const json = await res.json()
		expect(json.verse.text).toBeTruthy()
		expect(['ar', 'en']).toContain(json.language)
	})

	it('rejects an invalid date', async () => {
		const res = await app.request('/api/verse/2026-02-30')
		expect(res.status).toBe(400)
	})

	it('returns a verse for today without a date', async () => {
		const res = await app.request('/api/verse')
		expect(res.status).toBe(200)

		const json = await res.json()
		expect(json.verse.text).toBeTruthy()
		expect(json.reference).toBeTruthy()
	})
})
