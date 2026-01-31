import {
	getAllSeasonsForYear,
	getFastingPeriodsForYear,
	getLiturgicalSeasonForDate,
	isInFastingPeriod,
} from '@coptic/core'
import { describe, expect, it } from 'vitest'

describe('Liturgical Season Detection', () => {
	describe('getLiturgicalSeasonForDate', () => {
		it('should detect Nativity Fast (late November)', () => {
			const date = new Date(2024, 10, 30) // November 30, 2024
			const season = getLiturgicalSeasonForDate(date)

			expect(season).not.toBeNull()
			expect(season?.name).toBe('Nativity Fast')
			expect(season?.isFasting).toBe(true)
			expect(season?.type).toBe('fixed')
		})

		it('should detect Nativity Fast (early January)', () => {
			const date = new Date(2025, 0, 5) // January 5, 2025
			const season = getLiturgicalSeasonForDate(date)

			expect(season).not.toBeNull()
			expect(season?.name).toBe('Nativity Fast')
			expect(season?.isFasting).toBe(true)
		})

		it('should detect Great Lent', () => {
			// Easter 2025 is April 20, so Great Lent starts 55 days before
			// Great Lent starts approximately February 24, 2025
			const date = new Date(2025, 2, 1) // March 1, 2025
			const season = getLiturgicalSeasonForDate(date)

			expect(season).not.toBeNull()
			expect(season?.name).toBe('Great Lent')
			expect(season?.isFasting).toBe(true)
			expect(season?.type).toBe('moveable')
		})

		it('should detect Holy Week with priority over Great Lent', () => {
			// Palm Sunday 2025 is April 13 (7 days before Easter)
			const date = new Date(2025, 3, 15) // April 15, 2025 (Tuesday of Holy Week)
			const season = getLiturgicalSeasonForDate(date)

			expect(season).not.toBeNull()
			expect(season?.name).toBe('Holy Week')
			expect(season?.isFasting).toBe(true)
		})

		it('should detect Paschal Season', () => {
			// Easter 2025 is April 20, Paschal season runs for 50 days
			const date = new Date(2025, 3, 25) // April 25, 2025
			const season = getLiturgicalSeasonForDate(date)

			expect(season).not.toBeNull()
			expect(season?.name).toBe('Paschal Season')
			expect(season?.isFasting).toBe(false)
		})

		it('should detect Apostles Fast', () => {
			// Pentecost 2025 is June 8, Apostles Fast runs until July 12
			const date = new Date(2025, 5, 20) // June 20, 2025
			const season = getLiturgicalSeasonForDate(date)

			expect(season).not.toBeNull()
			expect(season?.name).toBe("Apostles' Fast")
			expect(season?.isFasting).toBe(true)
		})

		it('should return null for Ordinary Time', () => {
			// August should be outside any major season
			const date = new Date(2025, 7, 15) // August 15, 2025
			const season = getLiturgicalSeasonForDate(date)

			// Could be null or we handle it in the API layer
			expect(season).toBeNull()
		})
	})

	describe('getAllSeasonsForYear', () => {
		it('should return all seasons for a year', () => {
			const seasons = getAllSeasonsForYear(2025)

			expect(seasons.length).toBeGreaterThan(0)

			// Check that we have the major seasons
			const seasonNames = seasons.map((s) => s.name)
			expect(seasonNames).toContain('Great Lent')
			expect(seasonNames).toContain('Holy Week')
			expect(seasonNames).toContain('Paschal Season')
			expect(seasonNames).toContain("Apostles' Fast")
			expect(seasonNames).toContain('Nativity Fast')
		})

		it('should have valid date ranges for all seasons', () => {
			const seasons = getAllSeasonsForYear(2025)

			seasons.forEach((season) => {
				expect(season.startDate).toBeInstanceOf(Date)
				expect(season.endDate).toBeInstanceOf(Date)
				expect(season.endDate.getTime()).toBeGreaterThanOrEqual(season.startDate.getTime())
			})
		})
	})

	describe('isInFastingPeriod', () => {
		it('should return true during Nativity Fast', () => {
			const date = new Date(2024, 11, 25) // December 25, 2024
			expect(isInFastingPeriod(date)).toBe(true)
		})

		it('should return true during Great Lent', () => {
			const date = new Date(2025, 2, 15) // March 15, 2025
			expect(isInFastingPeriod(date)).toBe(true)
		})

		it('should return false during Paschal Season', () => {
			const date = new Date(2025, 3, 25) // April 25, 2025
			expect(isInFastingPeriod(date)).toBe(false)
		})

		it('should return false during Ordinary Time', () => {
			const date = new Date(2025, 7, 15) // August 15, 2025
			expect(isInFastingPeriod(date)).toBe(false)
		})
	})

	describe('getFastingPeriodsForYear', () => {
		it('should return only fasting periods', () => {
			const fastingPeriods = getFastingPeriodsForYear(2025)

			expect(fastingPeriods.length).toBeGreaterThan(0)

			// All returned periods should have isFasting: true
			fastingPeriods.forEach((period) => {
				expect(period.isFasting).toBe(true)
			})

			// Check for major fasts
			const fastNames = fastingPeriods.map((f) => f.name)
			expect(fastNames).toContain('Great Lent')
			expect(fastNames).toContain("Apostles' Fast")
			expect(fastNames).toContain('Nativity Fast')
		})
	})
})
