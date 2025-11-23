import { describe, it, expect } from 'vitest'
import { app } from '../index'

describe('API Endpoints', () => {
	describe('GET /health', () => {
		it('should return success and timestamp', async () => {
			const res = await app.request('/health')
			expect(res.status).toBe(200)

			const json = await res.json()
			expect(json).toHaveProperty('success', true)
			expect(json).toHaveProperty('timestamp')
		})
	})

	describe('GET /api/calendar', () => {
		it("should return today's Coptic date when no date provided", async () => {
			const res = await app.request('/api/calendar')
			expect(res.status).toBe(200)

			const json = await res.json()
			expect(json).toHaveProperty('dateString')
			expect(json).toHaveProperty('day')
			expect(json).toHaveProperty('month')
			expect(json).toHaveProperty('year')
			expect(json).toHaveProperty('monthString')
		})

		it('should convert specific Gregorian date to Coptic', async () => {
			const res = await app.request('/api/calendar/2025-01-15')
			expect(res.status).toBe(200)

			const json = await res.json()
			expect(json.dateString).toBe('Toba 7, 1741')
			expect(json.day).toBe(7)
			expect(json.month).toBe(5)
			expect(json.year).toBe(1741)
			expect(json.monthString).toBe('Toba')
		})

		it('should return 400 for invalid date', async () => {
			const res = await app.request('/api/calendar/invalid-date')
			expect(res.status).toBe(400)

			const json = await res.json()
			expect(json).toHaveProperty('error')
		})
	})

	describe('GET /api/readings', () => {
		it('should return readings for today when no date provided', async () => {
			const res = await app.request('/api/readings')
			expect(res.status).toBe(200)

			const json = await res.json()
			expect(json).toHaveProperty('reference')
			expect(json).toHaveProperty('Synxarium')
			expect(json).toHaveProperty('celebrations')
			expect(json).toHaveProperty('fullDate')
		})

		it('should return readings for specific date', async () => {
			const res = await app.request('/api/readings/2025-01-15')
			expect(res.status).toBe(200)

			const json = await res.json()
			expect(json.reference).toHaveProperty('VPsalm')
			expect(json.reference).toHaveProperty('VGospel')
			expect(json.reference).toHaveProperty('MPsalm')
			expect(json.reference).toHaveProperty('MGospel')
			expect(json.reference).toHaveProperty('Pauline')
			expect(json.reference).toHaveProperty('Catholic')
			expect(json.reference).toHaveProperty('Acts')
			expect(json.reference).toHaveProperty('LPsalm')
			expect(json.reference).toHaveProperty('LGospel')
			expect(Array.isArray(json.Synxarium)).toBe(true)
			// celebrations can be null or array depending on if there are celebrations for this day
			expect(json.celebrations === null || Array.isArray(json.celebrations)).toBe(true)
		})

		it('should return detailed readings when detailed=true', async () => {
			const res = await app.request('/api/readings/2025-01-15?detailed=true')
			expect(res.status).toBe(200)

			const json = await res.json()
			// Should have parsed reading arrays instead of reference object
			expect(json).not.toHaveProperty('reference')
			expect(json).toHaveProperty('VPsalm')
			expect(json).toHaveProperty('Synxarium')
			expect(Array.isArray(json.Synxarium)).toBe(true)
		})

		it('should return 400 for invalid date', async () => {
			const res = await app.request('/api/readings/not-a-date')
			expect(res.status).toBe(400)

			const json = await res.json()
			expect(json).toHaveProperty('error')
		})
	})

	describe('404 handler', () => {
		it('should return 404 for unknown routes', async () => {
			const res = await app.request('/unknown-route')
			expect(res.status).toBe(404)

			const json = await res.json()
			expect(json).toHaveProperty('error', 'Not Found')
		})
	})
})
