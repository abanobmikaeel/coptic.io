import { describe, expect, it } from 'vitest'
import { resolveDailyVerse } from '../../services/daily-verse.service'

// Dates are built with local components (new Date(y, m, d)) so the day never shifts
// across timezones, matching how the route parses YYYY-MM-DD locally.

describe('daily verse service', () => {
	it('resolves the featured verse for a fixed day', () => {
		const result = resolveDailyVerse(new Date(2026, 4, 20)) // Bashans 12
		expect(result).not.toBeNull()
		expect(result?.reference).toBe('John 10:11')
		expect(result?.readingSlot).toBe('LGospel')
		expect(result?.readingReference).toBe('John 10:1-16')
		expect(result?.verse).toMatchObject({ book: 'John', chapter: 10, verse: 11 })
		expect(result?.verse.text).toBeTruthy()
		expect(result?.fullDate.monthString).toBe('Bashans')
	})

	it('prefers the moveable reading over the fixed one', () => {
		const result = resolveDailyVerse(new Date(2026, 3, 5)) // Palm Sunday (offset -7)
		expect(result?.reference).toBe('Matthew 21:9')
		expect(result?.readingSlot).toBe('LGospel')
	})

	it('is deterministic for the same date and language', () => {
		expect(resolveDailyVerse(new Date(2026, 4, 20))).toEqual(
			resolveDailyVerse(new Date(2026, 4, 20)),
		)
	})

	it.each(['en', 'ar', 'es', 'cop'] as const)('resolves verse text for %s', (lang) => {
		const result = resolveDailyVerse(new Date(2026, 4, 20), lang)
		expect(result).not.toBeNull()
		expect(result?.verse.text).toBeTruthy()
		// Text is either in the requested language or a labelled English fallback.
		expect(['en', lang]).toContain(result?.language)
	})

	it('labels the fallback when a non-English translation is unavailable', () => {
		const result = resolveDailyVerse(new Date(2026, 4, 20), 'cop')
		expect(result).not.toBeNull()
		if (result?.language === 'en') {
			expect(result.fallback).toBe(true)
			expect(result.requestedLanguage).toBe('cop')
		}
	})
})
