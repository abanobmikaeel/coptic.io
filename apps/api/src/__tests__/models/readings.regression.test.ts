import { describe, expect, it } from 'vitest'
import { getByCopticDate, getReading, parseReadingString } from '../../models/readings'
import {
	getMultiChapterRange,
	getSingleChapter,
	getSingleVerse,
	getVerseRange,
} from '../../models/readings/verseTextTransformer'

/**
 * Regression tests for readings functionality
 *
 * These tests ensure that all verse patterns in the readings data are handled correctly.
 * The readings data contains various verse reference formats that must all parse without errors.
 */

describe('Verse Pattern Parsing - Regression Tests', () => {
	describe('Multi-chapter ranges (e.g., Acts 15:36-16:5)', () => {
		/**
		 * BUG FIX: Cross-chapter ranges like "Acts 15:36-16:5" were incorrectly parsed,
		 * causing NaN to be passed to the range() function and crashing with
		 * "Array length must be a positive integer of safe magnitude"
		 *
		 * Root cause: The verseRangePattern matched these patterns loosely,
		 * then splitAtIndex used lastIndexOf(':') which found the wrong colon.
		 */
		it('should parse "Acts 15:36-16:5" correctly', () => {
			const result = getMultiChapterRange('Acts 15:36-16:5')

			expect(result.bookName).toBe('Acts')
			expect(result.chapters.length).toBe(2)
			expect(result.chapters[0].chapterNum).toBe(15)
			expect(result.chapters[1].chapterNum).toBe(16)
			// Verify we got the right verses
			expect(result.chapters[0].verses[0]?.num).toBe(36)
			expect(result.chapters[1].verses[result.chapters[1].verses.length - 1]?.num).toBe(5)
		})

		it('should parse "2 Peter 1:19-2:8" correctly', () => {
			const result = getMultiChapterRange('2 Peter 1:19-2:8')

			expect(result.bookName).toBe('2 Peter')
			expect(result.chapters.length).toBe(2)
			expect(result.chapters[0].chapterNum).toBe(1)
			expect(result.chapters[1].chapterNum).toBe(2)
		})

		it('should parse "Matthew 4:23-5:16" correctly', () => {
			const result = getMultiChapterRange('Matthew 4:23-5:16')

			expect(result.bookName).toBe('Matthew')
			expect(result.chapters.length).toBe(2)
			expect(result.chapters[0].chapterNum).toBe(4)
			expect(result.chapters[1].chapterNum).toBe(5)
		})

		it('should be selected by getReading for multi-chapter patterns', () => {
			const result = getReading('Acts 15:36-16:5')

			expect(result).not.toBeNull()
			expect(result?.chapters.length).toBe(2)
		})
	})

	describe('Single-chapter verse ranges (e.g., Psalms 119:96-97)', () => {
		it('should parse single-chapter ranges correctly', () => {
			const result = getVerseRange('Psalms 89:19-21')

			expect(result.bookName).toBe('Psalms')
			expect(result.chapters.length).toBe(1)
			expect(result.chapters[0].chapterNum).toBe(89)
			expect(result.chapters[0].verses.length).toBe(3) // verses 19, 20, 21
		})

		it('should handle ranges at end of chapter', () => {
			const result = getVerseRange('Matthew 10:34-42')

			expect(result.bookName).toBe('Matthew')
			expect(result.chapters[0].verses.length).toBeGreaterThan(0)
		})
	})

	describe('Single verse references', () => {
		it('should parse single verse references', () => {
			const result = getSingleVerse('John 3:16')

			expect(result.bookName).toBe('John')
			expect(result.chapters[0].chapterNum).toBe(3)
			expect(result.chapters[0].verses.length).toBe(1)
		})
	})

	describe('Single chapter references', () => {
		it('should parse single chapter references', () => {
			const result = getSingleChapter('Psalms 119')

			expect(result.bookName).toBe('Psalms')
			expect(result.chapters[0].chapterNum).toBe(119)
			expect(result.chapters[0].verses.length).toBeGreaterThan(0)
		})
	})

	describe('Semicolon-separated references', () => {
		it('should parse semicolon-separated verse references', () => {
			const result = parseReadingString('Psalms 132:9-10;Psalms 132:17-18')

			expect(result).not.toBeNull()
			expect(result?.length).toBe(2)
			expect(result?.[0].bookName).toBe('Psalms')
			expect(result?.[1].bookName).toBe('Psalms')
		})

		it('should parse multi-chapter semicolon-separated references', () => {
			const result = parseReadingString('Hebrews 7:18-28;Hebrews 8:1-13')

			expect(result).not.toBeNull()
			expect(result?.length).toBe(2)
		})
	})
})

describe('getByCopticDate - Integration Regression Tests', () => {
	/**
	 * Test that readings for specific dates don't crash.
	 * These are dates known to have problematic verse patterns.
	 */

	it('should not crash for Jan 31, 2026 (23 Toba - has Acts 15:36-16:5)', () => {
		const date = new Date(2026, 0, 31) // Jan 31, 2026

		expect(() => getByCopticDate(date, true)).not.toThrow()

		const result = getByCopticDate(date, true)
		expect(result.Acts).not.toBeNull()
		expect(result.Acts?.[0].chapters.length).toBe(2) // Two chapters
	})

	it('should handle all reading types without errors', () => {
		const date = new Date(2026, 0, 31)
		const result = getByCopticDate(date, true)

		// All expected fields should be present
		expect(result.VPsalm).toBeDefined()
		expect(result.VGospel).toBeDefined()
		expect(result.MPsalm).toBeDefined()
		expect(result.MGospel).toBeDefined()
		expect(result.Pauline).toBeDefined()
		expect(result.Catholic).toBeDefined()
		expect(result.Acts).toBeDefined()
		expect(result.LPsalm).toBeDefined()
		expect(result.LGospel).toBeDefined()
		expect(result.Synaxarium).toBeDefined()
	})

	it('should return valid verse data for multi-chapter readings', () => {
		const date = new Date(2026, 0, 31)
		const result = getByCopticDate(date, true)

		const actsReading = result.Acts?.[0]
		expect(actsReading).toBeDefined()

		// Each chapter should have verses with valid structure
		for (const chapter of actsReading?.chapters ?? []) {
			expect(chapter.chapterNum).toBeGreaterThan(0)
			expect(chapter.verses.length).toBeGreaterThan(0)

			for (const verse of chapter.verses) {
				expect(verse.num).toBeGreaterThan(0)
				expect(typeof verse.text).toBe('string')
				expect(verse.text.length).toBeGreaterThan(0)
			}
		}
	})
})

describe('All Unique Readings Data Integrity', () => {
	/**
	 * Scan all unique readings to ensure none cause parsing errors.
	 * This catches data issues before they reach production.
	 */
	it('should parse all verse patterns in uniqueReadings.json without errors', async () => {
		const uniqueReadings = (await import('../../resources/uniqueReadings.json')).default
		const fields = [
			'VPsalm',
			'VGospel',
			'MPsalm',
			'MGospel',
			'Pauline',
			'Catholic',
			'Acts',
			'LPsalm',
			'LGospel',
		] as const

		const errors: string[] = []

		for (const reading of uniqueReadings) {
			for (const field of fields) {
				const verseStr = reading[field as keyof typeof reading] as string | undefined
				if (verseStr) {
					try {
						const result = parseReadingString(verseStr)
						// Check if any parsed result is null (unrecognized pattern)
						if (result === null) {
							errors.push(`Reading ${reading.id} ${field}: "${verseStr}" returned null`)
						}
					} catch (e) {
						errors.push(
							`Reading ${reading.id} ${field}: "${verseStr}" threw: ${e instanceof Error ? e.message : e}`,
						)
					}
				}
			}
		}

		// Report all errors at once for easier debugging
		if (errors.length > 0) {
			console.error('Parsing errors found:')
			errors.forEach((e) => console.error('  -', e))
		}

		expect(errors.length).toBe(0)
	})
})

describe('Full Year Readings Smoke Test', () => {
	/**
	 * Ensure readings work for an entire year without crashing due to
	 * parsing errors (like the multi-chapter range bug).
	 *
	 * Note: There's a known issue with month name mismatches between
	 * @coptic/core (uses Epep, Bashans) and synxarium.json (uses Abib, Bashons).
	 * These are filtered out as they're a data standardization issue, not a code bug.
	 */
	it('should not have parsing/array errors for 365 days', () => {
		const startDate = new Date(2025, 0, 1) // Jan 1, 2025
		const criticalErrors: string[] = []

		// Known month name mismatches to filter out
		const knownDataIssues = [
			'Synaxarium not found',
			'No reading found for day', // Leap year edge case
		]

		for (let i = 0; i < 365; i++) {
			const date = new Date(startDate)
			date.setDate(startDate.getDate() + i)

			try {
				getByCopticDate(date, true)
			} catch (e) {
				const msg = e instanceof Error ? e.message : 'Unknown error'
				// Only track critical errors (parsing bugs), not data gaps
				if (!knownDataIssues.some((known) => msg.includes(known))) {
					criticalErrors.push(`${date.toISOString().slice(0, 10)}: ${msg}`)
				}
			}
		}

		if (criticalErrors.length > 0) {
			console.error('Critical errors found:')
			criticalErrors.forEach((e) => console.error('  -', e))
		}

		expect(criticalErrors.length).toBe(0)
	})
})
