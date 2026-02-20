import { getEasterDate } from '@coptic/core'
import { describe, expect, it } from 'vitest'
import { getByCopticDate, parseReadingString } from '../../models/readings'

/**
 * Accuracy tests for Lenten Katameros and Jonah's Fast readings.
 *
 * Verifies that during Great Lent and Jonah's Fast, the API returns the
 * correct moveable readings instead of the fixed Coptic calendar readings.
 *
 * Reference data from: copticchurch.net canonical CSV
 */

describe('Lenten Readings - Accuracy', () => {
	describe('Correct readings for known Lent dates', () => {
		// Easter 2026 = April 12 → Lent starts Feb 16 (offset -55)
		it('should return Lenten readings for first day of Great Lent 2026 (Feb 16)', () => {
			const date = new Date(2026, 1, 16) // Feb 16, 2026
			const result = getByCopticDate(date, true)

			expect(result.season).toBe('Great Lent')
			expect(result.seasonDay).toBe('Monday of the first week of Great Lent')
			expect(result.Prophecies).not.toBeNull()
			expect(result.Pauline).not.toBeNull()
			expect(result.Catholic).not.toBeNull()
			expect(result.Acts).not.toBeNull()
			expect(result.MPsalm).not.toBeNull()
			expect(result.MGospel).not.toBeNull()
			expect(result.LPsalm).not.toBeNull()
			expect(result.LGospel).not.toBeNull()
		})

		// Verify specific verse references for Thursday of week 1 (offset -52)
		it('should return correct references for Thursday of week 1 (offset -52)', () => {
			// Easter 2025 = April 20 → offset -52 = Feb 27, 2025
			const date = new Date(2025, 1, 27) // Feb 27, 2025
			const result = getByCopticDate(date, true)

			expect(result.seasonDay).toBe('Thursday of the first week of Great Lent')

			// Prophecies: Isaiah 2:11-19 + Zechariah 8:18-23
			expect(result.Prophecies).not.toBeNull()
			expect(result.Prophecies!.length).toBe(2)
			expect(result.Prophecies![0].bookName).toBe('Isaiah')
			expect(result.Prophecies![0].chapters[0].chapterNum).toBe(2)
			expect(result.Prophecies![0].chapters[0].verses[0].num).toBe(11)
			expect(result.Prophecies![1].bookName).toBe('Zechariah')

			// Pauline: 1 Corinthians 4:16-5:9
			expect(result.Pauline).not.toBeNull()
			expect(result.Pauline![0].bookName).toBe('1 Corinthians')
			expect(result.Pauline![0].chapters[0].chapterNum).toBe(4)

			// Catholic: 1 John 1:8-2:11
			expect(result.Catholic).not.toBeNull()
			expect(result.Catholic![0].bookName).toBe('1 John')

			// Acts 8:3-13
			expect(result.Acts).not.toBeNull()
			expect(result.Acts![0].bookName).toBe('Acts')
			expect(result.Acts![0].chapters[0].chapterNum).toBe(8)
			expect(result.Acts![0].chapters[0].verses[0].num).toBe(3)

			// Gospel: Mark 4:21-29
			expect(result.LGospel).not.toBeNull()
			expect(result.LGospel![0].bookName).toBe('Mark')
			expect(result.LGospel![0].chapters[0].chapterNum).toBe(4)
		})

		// Lazarus Saturday (offset -8)
		it('should return correct readings for Lazarus Saturday', () => {
			// Easter 2026 = April 12 → offset -8 = April 4, 2026
			const date = new Date(2026, 3, 4) // April 4, 2026
			const result = getByCopticDate(date, true)

			expect(result.seasonDay).toBe('Lazarus Saturday')

			// Lazarus Saturday Gospel is John 11:1-45
			expect(result.LGospel).not.toBeNull()
			expect(result.LGospel![0].bookName).toBe('John')
			expect(result.LGospel![0].chapters[0].chapterNum).toBe(11)
			expect(result.LGospel![0].chapters[0].verses[0].num).toBe(1)
		})

		// Palm Sunday (offset -7)
		it('should return correct readings for Palm Sunday', () => {
			// Easter 2026 = April 12 → Palm Sunday = April 5, 2026
			const date = new Date(2026, 3, 5) // April 5, 2026
			const result = getByCopticDate(date, true)

			expect(result.seasonDay).toBe('Palm Sunday')

			// Palm Sunday has Vespers readings
			expect(result.VPsalm).not.toBeNull()
			expect(result.VGospel).not.toBeNull()
			expect(result.VGospel![0].bookName).toBe('John')
			expect(result.VGospel![0].chapters[0].chapterNum).toBe(12)

			// Pauline: Hebrews 9:11-28
			expect(result.Pauline).not.toBeNull()
			expect(result.Pauline![0].bookName).toBe('Hebrews')
		})
	})

	describe("Jonah's Fast readings", () => {
		it("should return Jonah's Fast readings for offset -69", () => {
			// Easter 2025 = April 20 → offset -69 = Feb 10, 2025
			const date = new Date(2025, 1, 10)
			const result = getByCopticDate(date, true)

			expect(result.season).toBe('Fast of Nineveh')
			expect(result.seasonDay).toBe("Monday of Jonah's Fast")
			expect(result.Prophecies).not.toBeNull()
			expect(result.Prophecies![0].bookName).toBe('Jonah')
		})

		it("should return Thursday after Jonah's Fast (offset -66)", () => {
			// Easter 2025 = April 20 → offset -66 = Feb 13, 2025
			const date = new Date(2025, 1, 13)
			const result = getByCopticDate(date, true)

			// Thursday falls outside the 3-day Nineveh fast season
			// but we still have readings for it
			expect(result.seasonDay).toBe("Thursday after Jonah's Fast")
		})
	})

	describe('Preparation week readings', () => {
		it('should return Preparation Saturday readings (offset -57)', () => {
			// Easter 2025 = April 20 → offset -57 = Feb 22, 2025
			const date = new Date(2025, 1, 22)
			const result = getByCopticDate(date, true)

			expect(result.seasonDay).toBe('Preparation Saturday of Great Lent')
			expect(result.Pauline).not.toBeNull()
		})

		it('should return Preparation Sunday readings (offset -56)', () => {
			// Easter 2025 = April 20 → offset -56 = Feb 23, 2025
			const date = new Date(2025, 1, 23)
			const result = getByCopticDate(date, true)

			expect(result.seasonDay).toBe('Preparation Sunday of Great Lent')
			expect(result.EPPsalm).not.toBeNull()
			expect(result.EPGospel).not.toBeNull()
		})
	})

	describe('Same offset produces same readings across years', () => {
		it('should return identical readings for offset -55 in 2025 and 2026', () => {
			const date2025 = new Date(2025, 1, 24)
			const date2026 = new Date(2026, 1, 16)

			const result2025 = getByCopticDate(date2025, true)
			const result2026 = getByCopticDate(date2026, true)

			expect(result2025.seasonDay).toBe(result2026.seasonDay)
			expect(result2025.seasonDay).toBe('Monday of the first week of Great Lent')

			expect(result2025.Pauline![0].bookName).toBe(result2026.Pauline![0].bookName)
			expect(result2025.LGospel![0].bookName).toBe(result2026.LGospel![0].bookName)
		})

		it('should return identical readings for Palm Sunday in 2025 and 2027', () => {
			const palmSunday2025 = new Date(2025, 3, 13)
			const palmSunday2027 = new Date(2027, 3, 25)

			const result2025 = getByCopticDate(palmSunday2025, true)
			const result2027 = getByCopticDate(palmSunday2027, true)

			expect(result2025.seasonDay).toBe('Palm Sunday')
			expect(result2027.seasonDay).toBe('Palm Sunday')

			expect(result2025.Pauline![0].bookName).toBe('Hebrews')
			expect(result2027.Pauline![0].bookName).toBe('Hebrews')
		})
	})

	describe('Non-Lent dates return fixed readings', () => {
		it('should return fixed readings for Jan 15, 2025 (outside Lent)', () => {
			const date = new Date(2025, 0, 15)
			const result = getByCopticDate(date, false)

			expect(result.season).toBeUndefined()
			expect(result.seasonDay).toBeUndefined()
			expect(result.reference).toBeDefined()
		})

		it('should return fixed readings for July 1, 2026 (well outside Lent)', () => {
			const date = new Date(2026, 6, 1)
			const result = getByCopticDate(date, false)

			expect(result.season).toBeUndefined()
			expect(result.reference).toBeDefined()
		})

		it('should return fixed readings for Easter Sunday itself (offset 0)', () => {
			const date = new Date(2026, 3, 12)
			const result = getByCopticDate(date, false)

			expect(result.season).toBeUndefined()
			expect(result.reference).toBeDefined()
		})
	})

	describe('Boundary dates', () => {
		it('should return Lenten reading for first day of Lent (offset -55)', () => {
			const date = new Date(2025, 1, 24)
			const result = getByCopticDate(date, true)

			expect(result.season).toBe('Great Lent')
			expect(result.seasonDay).toContain('first week')
		})

		it('should return Preparation Sunday for day before Lent (offset -56)', () => {
			// Easter 2025 = April 20 → offset -56 = Feb 23
			const date = new Date(2025, 1, 23)
			const result = getByCopticDate(date, true)

			// Now this is Preparation Sunday, a moveable reading
			expect(result.seasonDay).toBe('Preparation Sunday of Great Lent')
		})

		it('should return fixed reading before preparation week (offset -58)', () => {
			// Easter 2025 = April 20 → offset -58 = Feb 21
			const date = new Date(2025, 1, 21)
			const result = getByCopticDate(date, false)

			// This is before the preparation week, should be fixed reading
			// (unless it falls in Jonah's Fast range)
			const easter = getEasterDate(2025)
			const offset = Math.round((date.getTime() - easter.getTime()) / (1000 * 60 * 60 * 24))
			if (offset < -69 || offset > -66) {
				expect(result.reference).toBeDefined()
			}
		})

		it('should return Lenten reading for Palm Sunday (offset -7)', () => {
			const date = new Date(2025, 3, 13)
			const result = getByCopticDate(date, true)

			expect(result.season).toBeDefined()
			expect(result.seasonDay).toBe('Palm Sunday')
		})

		it('should return fixed reading for day after Palm Sunday (offset -6, Holy Week)', () => {
			const date = new Date(2025, 3, 14)
			const result = getByCopticDate(date, false)

			// Falls through to fixed readings since Holy Week isn't covered yet
			expect(result.reference).toBeDefined()
		})
	})

	describe('Detailed vs non-detailed mode', () => {
		it('should return season info in non-detailed mode for Lent date', () => {
			const date = new Date(2026, 1, 16)
			const result = getByCopticDate(date, false)

			expect(result.season).toBe('Great Lent')
			expect(result.seasonDay).toBe('Monday of the first week of Great Lent')
			expect(result.Synaxarium).toBeDefined()
			expect(result.Pauline).toBeUndefined()
			expect(result.LGospel).toBeUndefined()
		})

		it('should return full readings in detailed mode for Lent date', () => {
			const date = new Date(2026, 1, 16)
			const result = getByCopticDate(date, true)

			expect(result.season).toBe('Great Lent')
			expect(result.Pauline).not.toBeNull()
			expect(result.Pauline![0].chapters[0].verses.length).toBeGreaterThan(0)
			expect(result.Pauline![0].chapters[0].verses[0].text.length).toBeGreaterThan(0)
		})
	})

	describe('Saturdays and Sundays have correct structure', () => {
		it('Saturdays have no Prophecies (weekday-only reading)', () => {
			const date = new Date(2026, 1, 21)
			const result = getByCopticDate(date, true)

			expect(result.seasonDay).toBe('Saturday of the first week of Great Lent')
			expect(result.Prophecies).toBeNull()
			expect(result.Pauline).not.toBeNull()
			expect(result.LGospel).not.toBeNull()
		})

		it('Sundays have no Prophecies', () => {
			const date = new Date(2026, 1, 22)
			const result = getByCopticDate(date, true)

			expect(result.seasonDay).toBe('Sunday of the first week of Great Lent')
			expect(result.Prophecies).toBeNull()
			expect(result.Pauline).not.toBeNull()
		})
	})

	describe('All moveable readings parse without errors', () => {
		it('should parse all 55 moveable reading entries without errors', async () => {
			const lentReadings = (await import('../../resources/lentReadings.json')).default
			const jonahReadings = (await import('../../resources/jonahReadings.json')).default
			const fields = [
				'Prophecies',
				'VPsalm',
				'VGospel',
				'MPsalm',
				'MGospel',
				'Pauline',
				'Catholic',
				'Acts',
				'LPsalm',
				'LGospel',
				'EPPsalm',
				'EPGospel',
			] as const

			const allReadings = { ...jonahReadings, ...lentReadings }
			const entries = Object.entries(allReadings) as [string, Record<string, string | undefined>][]
			expect(entries.length).toBe(55)

			const errors: string[] = []

			for (const [offset, entry] of entries) {
				for (const field of fields) {
					const verseStr = entry[field]
					if (verseStr) {
						try {
							const result = parseReadingString(verseStr)
							if (result === null) {
								errors.push(`Offset ${offset} ${field}: "${verseStr}" returned null`)
							}
						} catch (e) {
							errors.push(
								`Offset ${offset} ${field}: "${verseStr}" threw: ${e instanceof Error ? e.message : e}`,
							)
						}
					}
				}
			}

			if (errors.length > 0) {
				console.error('Moveable reading parsing errors:')
				for (const e of errors) {
					console.error('  -', e)
				}
			}

			expect(errors.length).toBe(0)
		})
	})

	describe('Full Lent period smoke test across years', () => {
		it.each([2025, 2026, 2027, 2028])('should not crash for any day during Lent %i', (year) => {
			const easter = getEasterDate(year)
			const errors: string[] = []

			// Test full range: Jonah's Fast (-69) through Palm Sunday (-7)
			for (let offset = -69; offset <= -7; offset++) {
				const date = new Date(easter)
				date.setDate(easter.getDate() + offset)

				try {
					const result = getByCopticDate(date, true)
					// Offsets in our data should have season info
					if (offset >= -69 && offset <= -66) {
						// Jonah's Fast range
						if (result.seasonDay) {
							expect(result.seasonDay).toContain("Jonah's Fast")
						}
					} else if (offset >= -57 && offset <= -56) {
						// Preparation week: has moveable readings but not a formal liturgical season
						if (!result.seasonDay) {
							errors.push(
								`${date.toISOString().slice(0, 10)} (offset ${offset}): missing seasonDay`,
							)
						}
					} else if (offset >= -55 && offset <= -7) {
						// Great Lent range
						if (!result.season) {
							errors.push(`${date.toISOString().slice(0, 10)} (offset ${offset}): missing season`)
						}
					}
					// Offsets -65 to -58 are between Jonah's Fast and Preparation - these are normal days
				} catch (e) {
					errors.push(
						`${date.toISOString().slice(0, 10)} (offset ${offset}): ${e instanceof Error ? e.message : e}`,
					)
				}
			}

			if (errors.length > 0) {
				console.error(`Errors for Lent ${year}:`)
				for (const e of errors) {
					console.error('  -', e)
				}
			}

			expect(errors.length).toBe(0)
		})
	})
})
