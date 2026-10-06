import { describe, expect, it } from 'vitest'
import { app } from '../../index'

describe('GET /api/verse', () => {
	it('returns the daily verse for a fixed date', async () => {
		const res = await app.request('/api/verse/2026-05-20')
		expect(res.status).toBe(200)

		const json = await res.json()
		expect(json.reference).toBe('John 10:11')
		expect(json.readingSlot).toBe('LGospel')
		expect(json.readingReference).toBe('John 10:1-16')
		expect(json.verse).toMatchObject({ book: 'John', chapter: 10, verse: 11 })
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
