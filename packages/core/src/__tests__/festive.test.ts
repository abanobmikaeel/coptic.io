import { describe, expect, it } from 'vitest'
import { copticToGregorian } from '../calendar/conversion'
import { getLiturgicalContext } from '../liturgy/context'
import { getFestiveSeason } from '../liturgy/festive'

const local = (y: number, m: number, d: number) => new Date(y, m - 1, d)
const coptic = (year: number, month: number, day: number) => copticToGregorian({ year, month, day })

describe('getFestiveSeason', () => {
	// Pascha 2026 is April 12: day 39 (the Ascension) is May 21, day 49 (Pentecost) May 31.
	it.each([
		[local(2026, 4, 11), null], // Bright Saturday, the eve
		[local(2026, 4, 12), 'resurrection'],
		[local(2026, 5, 20), 'resurrection'], // the 39th day
		[local(2026, 5, 21), 'ascension'],
		[local(2026, 5, 31), 'ascension'], // Pentecost keeps the Ascension's verse
		[local(2026, 6, 1), null],
	])('follows Pascha through the Holy Fifty: %s', (date, expected) => {
		expect(getFestiveSeason(date)).toBe(expected)
	})

	it('follows Pascha in a year it falls in May', () => {
		// Pascha 2024 is May 5.
		expect(getFestiveSeason(local(2024, 5, 5))).toBe('resurrection')
		expect(getFestiveSeason(local(2024, 6, 13))).toBe('ascension')
		expect(getFestiveSeason(local(2024, 6, 23))).toBe('ascension')
		expect(getFestiveSeason(local(2024, 6, 24))).toBeNull()
	})

	it.each([
		[4, 28, null],
		[4, 29, 'nativity'],
		[5, 6, 'nativity'], // the Circumcision closes the season
		[5, 7, null],
		[5, 10, null], // the Paramoun of the Theophany
		[5, 11, 'theophany'],
		[5, 13, 'theophany'], // Cana of Galilee closes the season
		[5, 14, null],
		[1, 16, null],
		[1, 17, 'cross'],
		[1, 19, 'cross'],
		[1, 20, null],
		[7, 10, 'cross'],
		[7, 11, null],
	])('keys the fixed seasons off the Coptic date: month %i day %i', (month, day, expected) => {
		for (const year of [1742, 1743, 1744]) {
			expect(getFestiveSeason(coptic(year, month, day))).toBe(expected)
		}
	})

	it('lands on the expected Gregorian days in 2026', () => {
		expect(getFestiveSeason(local(2026, 1, 7))).toBe('nativity')
		expect(getFestiveSeason(local(2026, 1, 19))).toBe('theophany')
		expect(getFestiveSeason(local(2026, 9, 27))).toBe('cross')
		expect(getFestiveSeason(local(2026, 3, 19))).toBe('cross')
	})

	it('is null on an ordinary day', () => {
		expect(getFestiveSeason(local(2026, 10, 26))).toBeNull()
	})

	it('is part of the liturgical context', () => {
		expect(getLiturgicalContext(local(2026, 4, 12)).festiveSeason).toBe('resurrection')
		expect(getLiturgicalContext(local(2026, 10, 26)).festiveSeason).toBeNull()
	})
})
