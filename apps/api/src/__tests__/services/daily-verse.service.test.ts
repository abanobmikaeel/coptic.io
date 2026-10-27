import { gregorianToCoptic } from '@coptic/core'
import { describe, expect, it } from 'vitest'
import dayReadings from '../../resources/dayReadings.json'
import featuredVerses from '../../resources/featuredVerses.json'
import { resolveDailyVerse } from '../../services/daily-verse.service'

// Dates are built with local components (new Date(y, m, d)) so the day never shifts
// across timezones, matching how the route parses YYYY-MM-DD locally.

const fixedEntryFor = (date: Date) => {
	const coptic = gregorianToCoptic(date)
	const readingId = dayReadings[coptic.month - 1].readings[coptic.day - 1]
	return featuredVerses.fixed[String(readingId) as keyof typeof featuredVerses.fixed]
}

describe('daily verse service', () => {
	it('resolves the featured verse for a fixed day', () => {
		const date = new Date(2026, 4, 20) // Bashans 12
		const entry = fixedEntryFor(date)
		const result = resolveDailyVerse(date)
		expect(result).not.toBeNull()
		expect(result?.reference).toBe(entry.reference)
		expect(result?.readingSlot).toBe(entry.slot)
		expect(result?.readingReference).toBe(entry.reading)
		expect(`${result?.verse.book} ${result?.verse.chapter}:${result?.verse.verse}`).toBe(
			entry.reference,
		)
		expect(result?.verse.text).toBeTruthy()
		expect(result?.fullDate.monthString).toBe('Bashans')
	})

	it('prefers the moveable reading over the fixed one', () => {
		const date = new Date(2026, 3, 5) // Palm Sunday (offset -7)
		const moveable = featuredVerses.moveable['-7']
		expect(moveable.reference).not.toBe(fixedEntryFor(date).reference)

		const result = resolveDailyVerse(date)
		expect(result?.reference).toBe(moveable.reference)
		expect(result?.readingSlot).toBe(moveable.slot)
	})

	it('resolves a verse for every day across two decades', () => {
		const missing: string[] = []
		for (let d = new Date(2020, 0, 1); d < new Date(2041, 0, 1); d.setDate(d.getDate() + 1)) {
			if (!resolveDailyVerse(d)) missing.push(d.toDateString())
		}
		expect(missing).toEqual([])
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
