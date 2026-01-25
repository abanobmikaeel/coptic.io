import { describe, expect, it } from 'vitest'
import { app } from '../../index'

// API response types (dates serialized as strings)
interface SeasonResponse {
	name: string
	description: string
	startDate: string
	endDate: string
	isFasting: boolean
	type: string
}

interface FastingPeriodResponse {
	name: string
	description: string
	startDate: string
	endDate: string
	type: string
}

describe('Season API Endpoints', () => {
	describe('GET /api/season', () => {
		it('should return current season for today', async () => {
			const res = await app.request('/api/season')
			expect(res.status).toBe(200)

			const json = await res.json()
			expect(json).toHaveProperty('date')
			expect(json).toHaveProperty('season')
			expect(json).toHaveProperty('description')
			expect(json).toHaveProperty('isFasting')
		})

		it('should return season for specific date in Great Lent', async () => {
			// March 15, 2025 is during Great Lent
			const res = await app.request('/api/season/2025-03-15')
			expect(res.status).toBe(200)

			const json = await res.json()
			expect(json.season).toBe('Great Lent')
			expect(json.isFasting).toBe(true)
			expect(json.type).toBe('moveable')
		})

		it('should return season for specific date in Nativity Fast', async () => {
			// December 25, 2024 is during Nativity Fast
			const res = await app.request('/api/season/2024-12-25')
			expect(res.status).toBe(200)

			const json = await res.json()
			expect(json.season).toBe('Nativity Fast')
			expect(json.isFasting).toBe(true)
			expect(json.type).toBe('fixed')
		})

		it('should return season for specific date in Paschal Season', async () => {
			// April 25, 2025 is during Paschal Season (Easter is April 20)
			const res = await app.request('/api/season/2025-04-25')
			expect(res.status).toBe(200)

			const json = await res.json()
			expect(json.season).toBe('Paschal Season')
			expect(json.isFasting).toBe(false)
			expect(json.type).toBe('moveable')
		})

		it('should return Ordinary Time for dates outside liturgical seasons', async () => {
			// August 15, 2025 is likely Ordinary Time
			const res = await app.request('/api/season/2025-08-15')
			expect(res.status).toBe(200)

			const json = await res.json()
			expect(json.season).toBe('Ordinary Time')
			expect(json.isFasting).toBe(false)
		})

		it('should return 400 for invalid date', async () => {
			const res = await app.request('/api/season/invalid-date')
			expect(res.status).toBe(400)

			const json = await res.json()
			expect(json).toHaveProperty('error')
		})
	})

	describe('GET /api/season/year/:year', () => {
		it('should return all seasons for a valid year', async () => {
			const res = await app.request('/api/season/year/2025')
			expect(res.status).toBe(200)

			const json = await res.json()
			expect(json).toHaveProperty('year', 2025)
			expect(json).toHaveProperty('seasons')
			expect(Array.isArray(json.seasons)).toBe(true)
			expect(json.seasons.length).toBeGreaterThan(0)

			// Check that all seasons have required properties
			json.seasons.forEach((season: SeasonResponse) => {
				expect(season).toHaveProperty('name')
				expect(season).toHaveProperty('description')
				expect(season).toHaveProperty('startDate')
				expect(season).toHaveProperty('endDate')
				expect(season).toHaveProperty('isFasting')
				expect(season).toHaveProperty('type')
			})
		})

		it('should include major seasons', async () => {
			const res = await app.request('/api/season/year/2025')
			expect(res.status).toBe(200)

			const json = await res.json()
			const seasonNames = json.seasons.map((s: SeasonResponse) => s.name)

			expect(seasonNames).toContain('Great Lent')
			expect(seasonNames).toContain('Holy Week')
			expect(seasonNames).toContain('Paschal Season')
			expect(seasonNames).toContain("Apostles' Fast")
			expect(seasonNames).toContain('Nativity Fast')
		})

		it('should return 400 for year out of range', async () => {
			const res = await app.request('/api/season/year/1800')
			expect(res.status).toBe(400)

			const json = await res.json()
			expect(json).toHaveProperty('error')
		})

		it('should return 400 for invalid year', async () => {
			const res = await app.request('/api/season/year/invalid')
			expect(res.status).toBe(400)

			const json = await res.json()
			expect(json).toHaveProperty('error')
		})
	})

	describe('GET /api/season/fasting/:year', () => {
		it('should return all fasting periods for a valid year', async () => {
			const res = await app.request('/api/season/fasting/2025')
			expect(res.status).toBe(200)

			const json = await res.json()
			expect(json).toHaveProperty('year', 2025)
			expect(json).toHaveProperty('fastingPeriods')
			expect(Array.isArray(json.fastingPeriods)).toBe(true)
			expect(json.fastingPeriods.length).toBeGreaterThan(0)

			// All periods should be fasting periods
			json.fastingPeriods.forEach((period: FastingPeriodResponse) => {
				expect(period).toHaveProperty('name')
				expect(period).toHaveProperty('description')
				expect(period).toHaveProperty('startDate')
				expect(period).toHaveProperty('endDate')
				expect(period).toHaveProperty('type')
			})
		})

		it('should include major fasting periods', async () => {
			const res = await app.request('/api/season/fasting/2025')
			expect(res.status).toBe(200)

			const json = await res.json()
			const fastNames = json.fastingPeriods.map((f: FastingPeriodResponse) => f.name)

			expect(fastNames).toContain('Great Lent')
			expect(fastNames).toContain('Holy Week')
			expect(fastNames).toContain("Apostles' Fast")
			expect(fastNames).toContain('Nativity Fast')
		})

		it('should return 400 for year out of range', async () => {
			const res = await app.request('/api/season/fasting/2300')
			expect(res.status).toBe(400)

			const json = await res.json()
			expect(json).toHaveProperty('error')
		})
	})
})
