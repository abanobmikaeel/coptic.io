import { describe, expect, it } from 'vitest'
import { getDaysFromEaster } from '../calendar/pascha'
import { getKiahkPsalmodyWeek, getReadingCycle } from '../liturgy/readingCycle'

const local = (y: number, m: number, d: number) => new Date(y, m - 1, d)

describe('getReadingCycle', () => {
	describe('Sundays', () => {
		it('reads the Sunday of the Coptic month, not the day of the month', () => {
			// 8 Baba 1743 is the second Sunday of Baba
			expect(getReadingCycle(local(2026, 10, 18))).toEqual({
				cycle: 'sunday',
				month: 2,
				sunday: 2,
			})
		})

		it('reads the weekday after it from the annual cycle', () => {
			expect(getReadingCycle(local(2026, 10, 19))).toEqual({ cycle: 'annual', month: 2, day: 9 })
		})

		it('reads the single Sunday of Nasie whatever its day', () => {
			expect(getReadingCycle(local(2024, 9, 8))).toEqual({ cycle: 'sunday', month: 13, sunday: 1 })
		})

		it('reads 29 Paremhat on a Sunday keeping the monthly commemoration', () => {
			// 29 Hatour
			expect(getReadingCycle(local(2024, 12, 8))).toEqual({ cycle: 'annual', month: 7, day: 29 })
		})

		it('keeps the Sunday on the 29th of Tobi, which has no monthly commemoration', () => {
			expect(getReadingCycle(local(2033, 2, 6))).toEqual({ cycle: 'sunday', month: 6, sunday: 2 })
		})

		it('reads the second Sunday of Amshir on a fifth Sunday from Tout to Amshir', () => {
			const secondOfAmshir = { cycle: 'sunday', month: 6, sunday: 2 }
			expect(getReadingCycle(local(2032, 10, 10))).toEqual(secondOfAmshir) // 30 Tout
			expect(getReadingCycle(local(2025, 11, 9))).toEqual(secondOfAmshir) // 30 Baba
			expect(getReadingCycle(local(2027, 2, 7))).toEqual(secondOfAmshir) // 30 Tobi
		})

		it('keeps the fifth Sunday of the month from Paremhat to Mesra', () => {
			expect(getReadingCycle(local(2026, 6, 7))).toEqual({ cycle: 'sunday', month: 9, sunday: 5 })
			expect(getReadingCycle(local(2027, 9, 5))).toEqual({ cycle: 'sunday', month: 12, sunday: 5 })
		})

		it('keeps the Sunday after the Nativity on its annual reading (Kiahk 30)', () => {
			expect(getReadingCycle(local(2028, 1, 9))).toEqual({ cycle: 'annual', month: 4, day: 30 })
		})
	})

	describe('Tout when the Nayrouz is a Sunday', () => {
		// 1 Tout 1744 falls on Sunday 12 September 2027
		it('reads the Nayrouz itself', () => {
			expect(getReadingCycle(local(2027, 9, 12))).toEqual({ cycle: 'annual', month: 1, day: 1 })
		})

		it("moves each of Tout's Sundays back by one", () => {
			expect(getReadingCycle(local(2027, 9, 19))).toEqual({ cycle: 'sunday', month: 1, sunday: 1 })
			expect(getReadingCycle(local(2027, 9, 26))).toEqual({ cycle: 'sunday', month: 1, sunday: 2 })
			expect(getReadingCycle(local(2027, 10, 3))).toEqual({ cycle: 'sunday', month: 1, sunday: 3 })
		})

		it('reads 29 Paremhat on the last Sunday', () => {
			expect(getReadingCycle(local(2027, 10, 10))).toEqual({ cycle: 'annual', month: 7, day: 29 })
		})
	})

	describe("the Sunday before Jonah's Fast on a fifth Sunday of Tobi", () => {
		it('reads the Preparation Sunday of Great Lent', () => {
			expect(getDaysFromEaster(local(2039, 2, 6))).toBe(-70)
			expect(getReadingCycle(local(2039, 2, 6))).toEqual({
				cycle: 'greatLent',
				daysFromEaster: -56,
			})
		})

		it('keeps an ordinary Sunday on that day in other years', () => {
			expect(getDaysFromEaster(local(2026, 2, 1))).toBe(-70)
			expect(getReadingCycle(local(2026, 2, 1))).toEqual({ cycle: 'sunday', month: 5, sunday: 4 })
		})
	})

	describe('Kiahk when the Paramoun is a Sunday', () => {
		// Kiahk 28 1740 falls on Sunday 7 January 2024
		it('reads the Paramoun itself', () => {
			expect(getReadingCycle(local(2024, 1, 7))).toEqual({ cycle: 'annual', month: 4, day: 28 })
		})

		it("gives the last Sunday of Hatour Kiahk's first Sunday", () => {
			// Hatour 30
			expect(getReadingCycle(local(2023, 12, 10))).toEqual({
				cycle: 'sunday',
				month: 4,
				sunday: 1,
			})
		})

		it('moves each Kiahk Sunday on by one', () => {
			// Kiahk 7, 14, 21
			expect(getReadingCycle(local(2023, 12, 17))).toMatchObject({ month: 4, sunday: 2 })
			expect(getReadingCycle(local(2023, 12, 24))).toMatchObject({ month: 4, sunday: 3 })
			expect(getReadingCycle(local(2023, 12, 31))).toMatchObject({ month: 4, sunday: 4 })
		})

		it('leaves Kiahk alone in a year the Paramoun is not a Sunday', () => {
			// Kiahk 7 1743, Sunday 16 December 2026
			expect(getReadingCycle(local(2026, 12, 20))).toEqual({ cycle: 'sunday', month: 4, sunday: 2 })
		})
	})

	describe('Fixed feasts', () => {
		it('reads the Nayrouz on a Sunday', () => {
			expect(getReadingCycle(local(2027, 9, 12))).toEqual({ cycle: 'annual', month: 1, day: 1 })
		})

		it('reads the Entrance into the Temple on the Preparation Sunday of Lent', () => {
			const date = local(2026, 2, 15)
			expect(getDaysFromEaster(date)).toBe(-56)
			expect(getReadingCycle(date)).toEqual({ cycle: 'annual', month: 6, day: 8 })
		})

		it('reads the Entrance into Egypt on a weekday of the Holy Fifty', () => {
			expect(getReadingCycle(local(2027, 6, 1))).toEqual({ cycle: 'annual', month: 9, day: 24 })
		})

		it('gives way to the Ascension when they coincide', () => {
			// Easter 2006 is 23 April, so 24 Bashans (1 June) is the 40th day
			expect(getReadingCycle(local(2006, 6, 1))).toEqual({ cycle: 'holyFifty', daysFromEaster: 39 })
		})

		it('is not kept in Holy Week', () => {
			// The Annunciation, 29 Paremhat, on Holy Tuesday 2026
			expect(getReadingCycle(local(2026, 4, 7))).toEqual({ cycle: 'holyWeek', daysFromEaster: -5 })
		})
	})

	describe('Seasons from Easter', () => {
		// Easter 2027 is 2 May
		it.each([
			[local(2027, 2, 22), 'jonah', -69], // Monday of Jonah's Fast
			[local(2027, 3, 6), 'greatLent', -57], // Preparation Saturday
			[local(2027, 4, 25), 'greatLent', -7], // Palm Sunday
			[local(2027, 4, 26), 'holyWeek', -6], // Holy Monday
			[local(2027, 5, 1), 'holyWeek', -1], // Great Saturday
			[local(2027, 5, 2), 'holyFifty', 0], // Easter
			[local(2027, 5, 9), 'holyFifty', 7], // Thomas Sunday
			[local(2027, 6, 20), 'holyFifty', 49], // Pentecost
		])('%s is %s, %i days from Easter', (date, cycle, daysFromEaster) => {
			expect(getReadingCycle(date)).toEqual({ cycle, daysFromEaster })
		})

		it('returns to the annual cycle the day after Pentecost', () => {
			expect(getReadingCycle(local(2027, 6, 21)).cycle).toBe('annual')
		})

		it('returns to the Sunday cycle the Sunday after Pentecost', () => {
			expect(getReadingCycle(local(2027, 6, 27)).cycle).toBe('sunday')
		})
	})
})

describe('getKiahkPsalmodyWeek', () => {
	it('is null outside the rite, which starts at the first of Kiahk, not the Nativity Fast', () => {
		expect(getKiahkPsalmodyWeek(local(2026, 11, 25))).toBeNull() // Hatour 16
		expect(getKiahkPsalmodyWeek(local(2026, 12, 9))).toBeNull() // Hatour 30
		expect(getKiahkPsalmodyWeek(local(2026, 12, 10))).toBe(1) // Kiahk 1
	})

	it('ends at the Paramoun', () => {
		expect(getKiahkPsalmodyWeek(local(2027, 1, 5))).toBe(4) // Kiahk 27
		expect(getKiahkPsalmodyWeek(local(2027, 1, 6))).toBeNull() // Kiahk 28
		expect(getKiahkPsalmodyWeek(local(2027, 1, 7))).toBeNull()
	})

	it('numbers a week by the Sunday it leads to', () => {
		expect(getKiahkPsalmodyWeek(local(2026, 12, 12))).toBe(1)
		expect(getKiahkPsalmodyWeek(local(2026, 12, 13))).toBe(1)
		expect(getKiahkPsalmodyWeek(local(2026, 12, 19))).toBe(2)
		expect(getKiahkPsalmodyWeek(local(2026, 12, 26))).toBe(3)
		expect(getKiahkPsalmodyWeek(local(2027, 1, 2))).toBe(4)
	})

	it('follows the Sunday shift when the Paramoun is a Sunday', () => {
		// Hatour 30 reads Kiahk's first Sunday, so the month opens in the second week
		expect(getKiahkPsalmodyWeek(local(2023, 12, 10))).toBeNull()
		expect(getKiahkPsalmodyWeek(local(2023, 12, 16))).toBe(2)
		expect(getKiahkPsalmodyWeek(local(2023, 12, 30))).toBe(4)
		expect(getKiahkPsalmodyWeek(local(2024, 1, 6))).toBe(4) // Kiahk 27
	})
})
