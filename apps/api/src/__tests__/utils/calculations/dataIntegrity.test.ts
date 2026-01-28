import { describe, expect, it } from 'vitest'
import dayReadings from '../../../resources/dayReadings.json'
import { celebrations } from '../../../resources/nonMoveableCelebrations.json'

/**
 * DATA INTEGRITY TESTS
 *
 * Validates internal consistency of static data files:
 * - dayReadings.json (Coptic month → reading IDs + celebration IDs)
 * - nonMoveableCelebrations.json (celebration definitions)
 *
 * These tests catch data corruption, missing references, and structural issues.
 */

describe('Coptic Calendar Structure', () => {
	const expectedMonths = [
		'Tout',
		'Baba',
		'Hatoor',
		'Kiahk',
		'Toba',
		'Amshir',
		'Baramhat',
		'Baramoda',
		'Bashans',
		'Baona',
		'Apip',
		'Mesra',
		'Nasie',
	]

	it('should have all 13 Coptic months', () => {
		expect(dayReadings.length).toBe(13)
	})

	it('should have months in correct order', () => {
		dayReadings.forEach((month, index) => {
			expect(month.month).toBe(expectedMonths[index])
		})
	})

	it('months 1-12 should have exactly 30 days of readings', () => {
		for (let i = 0; i < 12; i++) {
			expect(dayReadings[i].readings.length).toBe(30)
			expect(dayReadings[i].daysWithCelebrations.length).toBe(30)
		}
	})

	it('Nasie should have 5 or 6 days of readings', () => {
		const nasie = dayReadings[12]
		expect(nasie.month).toBe('Nasie')
		expect(nasie.readings.length).toBeGreaterThanOrEqual(5)
		expect(nasie.readings.length).toBeLessThanOrEqual(6)
	})

	it('total days should equal 365 or 366', () => {
		const totalDays = dayReadings.reduce((sum, month) => sum + month.readings.length, 0)
		expect([365, 366]).toContain(totalDays)
	})
})

describe('Celebration Data Integrity', () => {
	it('should have no duplicate celebration IDs', () => {
		const ids = celebrations.map((c) => c.id)
		const uniqueIds = new Set(ids)
		expect(uniqueIds.size).toBe(ids.length)
	})

	it('every celebration reference in dayReadings should resolve to a valid entry', () => {
		const validIds = new Set(celebrations.map((c) => c.id))

		dayReadings.forEach((month) => {
			month.daysWithCelebrations.forEach((celebEntry, dayIndex) => {
				if (celebEntry === 0) return // no celebration

				const ids = Array.isArray(celebEntry) ? celebEntry : [celebEntry]
				ids.forEach((id) => {
					expect(
						validIds.has(id),
						`Month ${month.month}, day ${dayIndex + 1}: celebration ID ${id} not found in nonMoveableCelebrations.json`,
					).toBe(true)
				})
			})
		})
	})

	it('every reading ID in dayReadings should be a non-negative number', () => {
		dayReadings.forEach((month) => {
			month.readings.forEach((readingId, dayIndex) => {
				expect(
					typeof readingId,
					`Month ${month.month}, day ${dayIndex + 1}: reading ID should be a number`,
				).toBe('number')
				expect(
					readingId,
					`Month ${month.month}, day ${dayIndex + 1}: reading ID should be >= 0`,
				).toBeGreaterThanOrEqual(0)
			})
		})
	})

	it('all celebrations should have required fields', () => {
		celebrations.forEach((celebration) => {
			expect(celebration.id).toBeDefined()
			expect(typeof celebration.id).toBe('number')
			expect(celebration.name).toBeDefined()
			expect(typeof celebration.name).toBe('string')
			expect(celebration.name.trim().length).toBeGreaterThan(0)
			expect(celebration.type).toBeDefined()
		})
	})
})

describe('Fixed Celebration Placement', () => {
	/**
	 * Verify key fixed celebrations appear on the correct Coptic calendar days
	 * in the dayReadings data.
	 *
	 * Source: https://st-takla.org/faith/en/terms/feasts.html
	 */

	// Helper: get celebration IDs for a Coptic month/day (1-indexed)
	const getCelebrationIds = (monthIndex: number, day: number): number[] => {
		const entry = dayReadings[monthIndex].daysWithCelebrations[day - 1]
		if (entry === 0) return []
		return Array.isArray(entry) ? entry : [entry]
	}

	const getCelebrationNames = (monthIndex: number, day: number): string[] => {
		const ids = getCelebrationIds(monthIndex, day)
		return ids.map((id) => celebrations.find((c) => c.id === id)?.name ?? `unknown(${id})`)
	}

	it('Nayrouz (Tout 1) should have a celebration', () => {
		const names = getCelebrationNames(0, 1) // Tout = index 0
		expect(names.length).toBeGreaterThan(0)
		expect(names.some((n) => n.includes('Nayrouz') || n.includes('New Year'))).toBe(true)
	})

	it('Feast of the Cross (Tout 17) should have a celebration', () => {
		const names = getCelebrationNames(0, 17) // Tout = index 0
		expect(names.length).toBeGreaterThan(0)
		expect(names.some((n) => n.includes('Cross'))).toBe(true)
	})

	it('Nativity (Kiahk 29) should have a celebration', () => {
		const names = getCelebrationNames(3, 29) // Kiahk = index 3
		expect(names.length).toBeGreaterThan(0)
		expect(names.some((n) => n.includes('Nativity'))).toBe(true)
	})

	it('Theophany (Toba 11) should have a celebration', () => {
		const names = getCelebrationNames(4, 11) // Toba = index 4
		expect(names.length).toBeGreaterThan(0)
		expect(names.some((n) => n.includes('Theophany'))).toBe(true)
	})

	it('Cana (Toba 13) should have a celebration', () => {
		const names = getCelebrationNames(4, 13) // Toba = index 4
		expect(names.length).toBeGreaterThan(0)
		expect(names.some((n) => n.includes('Cana') || n.includes('Galilee'))).toBe(true)
	})

	it('Entry into Temple (Amshir 8) should have a celebration', () => {
		const names = getCelebrationNames(5, 8) // Amshir = index 5
		expect(names.length).toBeGreaterThan(0)
		expect(names.some((n) => n.includes('Temple') || n.includes('Entrance'))).toBe(true)
	})

	it('Annunciation (Baramhat 29) should have a celebration', () => {
		const names = getCelebrationNames(6, 29) // Baramhat = index 6
		expect(names.length).toBeGreaterThan(0)
		expect(names.some((n) => n.includes('Annunciation'))).toBe(true)
	})

	it('Flight to Egypt (Bashans 24) should have a celebration', () => {
		const names = getCelebrationNames(8, 24) // Bashans = index 8
		expect(names.length).toBeGreaterThan(0)
		expect(names.some((n) => n.includes('Egypt') || n.includes('Entry'))).toBe(true)
	})

	it('Transfiguration (Mesra 13) should have a celebration', () => {
		const names = getCelebrationNames(11, 13) // Mesra = index 11
		expect(names.length).toBeGreaterThan(0)
		expect(names.some((n) => n.includes('Transfiguration'))).toBe(true)
	})
})
