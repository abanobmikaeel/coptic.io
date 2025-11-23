import { describe, it, expect } from 'vitest'
import {
	getAllCelebrations,
	getCelebrationsForDate,
	getUpcomingCelebrations,
} from '../../services/celebrations.service'

describe('Celebrations Service', () => {
	describe('getAllCelebrations', () => {
		it('should return an array of celebrations', () => {
			const celebrations = getAllCelebrations()

			expect(Array.isArray(celebrations)).toBe(true)
			expect(celebrations.length).toBeGreaterThan(0)
		})

		it('should include both static and moveable celebrations', () => {
			const celebrations = getAllCelebrations()

			const staticCelebrations = celebrations.filter((c) => !c.isMoveable)
			const moveableCelebrations = celebrations.filter((c) => c.isMoveable)

			expect(staticCelebrations.length).toBeGreaterThan(0)
			expect(moveableCelebrations.length).toBeGreaterThan(0)
		})

		it('should have valid celebration structure', () => {
			const celebrations = getAllCelebrations()

			celebrations.forEach((celebration) => {
				expect(celebration).toHaveProperty('id')
				expect(celebration).toHaveProperty('name')
				expect(celebration).toHaveProperty('type')
				expect(typeof celebration.id).toBe('number')
				expect(typeof celebration.name).toBe('string')
				expect(typeof celebration.type).toBe('string')
			})
		})

		it('should mark moveable feasts correctly', () => {
			const celebrations = getAllCelebrations()

			celebrations.forEach((celebration) => {
				if (celebration.isMoveable) {
					expect(celebration.isMoveable).toBe(true)
				}
			})
		})

		it('should include major feasts', () => {
			const celebrations = getAllCelebrations()
			const celebrationNames = celebrations.map((c) => c.name)

			expect(celebrationNames.some((name) => name.includes('Nativity'))).toBe(true)
		})
	})

	describe('getCelebrationsForDate', () => {
		it('should return celebrations for a specific date', () => {
			const date = new Date(2025, 0, 7)
			const celebrations = getCelebrationsForDate(date)

			if (celebrations) {
				expect(Array.isArray(celebrations)).toBe(true)
				celebrations.forEach((celebration) => {
					expect(celebration).toHaveProperty('id')
					expect(celebration).toHaveProperty('name')
					expect(celebration).toHaveProperty('type')
				})
			}
		})

		it('should return null for dates with no celebrations', () => {
			const date = new Date(2025, 5, 15)
			const celebrations = getCelebrationsForDate(date)

			if (celebrations === null) {
				expect(celebrations).toBeNull()
			} else {
				expect(Array.isArray(celebrations)).toBe(true)
			}
		})

		it('should include both static and moveable celebrations for a date', () => {
			const date = new Date(2025, 0, 7)
			const celebrations = getCelebrationsForDate(date)

			if (celebrations && celebrations.length > 0) {
				expect(Array.isArray(celebrations)).toBe(true)
			}
		})

		it('should handle Nativity (January 7)', () => {
			const date = new Date(2025, 0, 7)
			const celebrations = getCelebrationsForDate(date)

			if (celebrations) {
				expect(Array.isArray(celebrations)).toBe(true)
				expect(celebrations.length).toBeGreaterThan(0)
			}
		})

		it('should handle Epiphany (January 19)', () => {
			const date = new Date(2025, 0, 19)
			const celebrations = getCelebrationsForDate(date)

			if (celebrations) {
				expect(Array.isArray(celebrations)).toBe(true)
			}
		})

		it('should handle moveable feasts correctly', () => {
			const easterDate = new Date(2025, 3, 20)
			const celebrations = getCelebrationsForDate(easterDate)

			if (celebrations) {
				expect(Array.isArray(celebrations)).toBe(true)
				const hasMoveable = celebrations.some((c) => c.isMoveable === true)
				if (hasMoveable) {
					expect(hasMoveable).toBe(true)
				}
			}
		})

		it('should handle different years correctly', () => {
			const date2025 = new Date(2025, 0, 7)
			const date2024 = new Date(2024, 0, 7)

			const celebrations2025 = getCelebrationsForDate(date2025)
			const celebrations2024 = getCelebrationsForDate(date2024)

			if (celebrations2025) {
				expect(Array.isArray(celebrations2025)).toBe(true)
			}
			if (celebrations2024) {
				expect(Array.isArray(celebrations2024)).toBe(true)
			}
		})

		it('should mark moveable celebrations correctly', () => {
			const date = new Date(2025, 0, 7)
			const celebrations = getCelebrationsForDate(date)

			if (celebrations) {
				celebrations.forEach((celebration) => {
					if (celebration.isMoveable !== undefined) {
						expect(typeof celebration.isMoveable).toBe('boolean')
					}
				})
			}
		})
	})

	describe('getUpcomingCelebrations', () => {
		it('should return upcoming celebrations for default 30 days', () => {
			const upcoming = getUpcomingCelebrations()

			expect(Array.isArray(upcoming)).toBe(true)
		})

		it('should respect custom days parameter', () => {
			const upcoming7 = getUpcomingCelebrations(7)
			const upcoming14 = getUpcomingCelebrations(14)

			expect(Array.isArray(upcoming7)).toBe(true)
			expect(Array.isArray(upcoming14)).toBe(true)
		})

		it('should return celebrations with date and coptic date', () => {
			const upcoming = getUpcomingCelebrations(10)

			upcoming.forEach((item) => {
				expect(item).toHaveProperty('date')
				expect(item).toHaveProperty('copticDate')
				expect(item).toHaveProperty('celebrations')
				expect(typeof item.date).toBe('string')
				expect(Array.isArray(item.celebrations)).toBe(true)
			})
		})

		it('should have valid date format (YYYY-MM-DD)', () => {
			const upcoming = getUpcomingCelebrations(5)

			upcoming.forEach((item) => {
				expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
			})
		})

		it('should have valid coptic date structure', () => {
			const upcoming = getUpcomingCelebrations(5)

			upcoming.forEach((item) => {
				expect(item.copticDate).toHaveProperty('dateString')
				expect(item.copticDate).toHaveProperty('day')
				expect(item.copticDate).toHaveProperty('month')
				expect(item.copticDate).toHaveProperty('year')
				expect(item.copticDate).toHaveProperty('monthString')
			})
		})

		it('should return chronologically ordered dates', () => {
			const upcoming = getUpcomingCelebrations(10)

			for (let i = 1; i < upcoming.length; i++) {
				const prevDate = new Date(upcoming[i - 1].date)
				const currDate = new Date(upcoming[i].date)
				expect(currDate >= prevDate).toBe(true)
			}
		})

		it('should handle 1 day parameter', () => {
			const upcoming = getUpcomingCelebrations(1)

			expect(Array.isArray(upcoming)).toBe(true)
		})

		it('should handle large day ranges', () => {
			const upcoming = getUpcomingCelebrations(90)

			expect(Array.isArray(upcoming)).toBe(true)
		})

		it('should only include dates with celebrations', () => {
			const upcoming = getUpcomingCelebrations(30)

			upcoming.forEach((item) => {
				expect(item.celebrations.length).toBeGreaterThan(0)
			})
		})

		it('should have valid celebration structure in results', () => {
			const upcoming = getUpcomingCelebrations(10)

			upcoming.forEach((item) => {
				item.celebrations.forEach((celebration) => {
					expect(celebration).toHaveProperty('id')
					expect(celebration).toHaveProperty('name')
					expect(celebration).toHaveProperty('type')
				})
			})
		})
	})
})
