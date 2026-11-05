import { getReadingCycle, gregorianToCoptic } from '@coptic/core'
import { describe, expect, it } from 'vitest'
import dayReadings from '../../resources/dayReadings.json'
import featuredVerses from '../../resources/featuredVerses.json'
import holyFiftyReadings from '../../resources/holyFiftyReadings.json'
import sundayReadings from '../../resources/sundayReadings.json'
import { getReading } from '../../services/bible/passages'
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
		const date = new Date(2026, 9, 27) // Tuesday, Baba 17
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
		expect(result?.fullDate.monthString).toBe('Baba')
	})

	it('prefers the moveable reading over the fixed one', () => {
		const date = new Date(2026, 3, 5) // Palm Sunday (offset -7)
		const moveable = featuredVerses.moveable['-7']
		expect(moveable.reference).not.toBe(fixedEntryFor(date).reference)

		const result = resolveDailyVerse(date)
		expect(result?.reference).toBe(moveable.reference)
		expect(result?.readingSlot).toBe(moveable.slot)
	})

	// Regression: Sundays and the Holy Fifty served their own readings but took the
	// verse of the fixed-date weekday readings
	it('takes a Sunday verse from the Sunday readings', () => {
		const date = new Date(2026, 10, 1) // Sunday, Baba 22
		const cycle = getReadingCycle(date)
		expect(cycle.cycle).toBe('sunday')
		const entry = featuredVerses.sunday['2:4']
		expect(entry.reading).toBe(sundayReadings['2:4'].LGospel)
		expect(resolveDailyVerse(date)?.reference).toBe(entry.reference)
	})

	it('takes a Holy Fifty verse from the Holy Fifty readings', () => {
		const date = new Date(2026, 4, 20) // 38 days after Easter, Bashans 12
		const entry = featuredVerses.moveable['38']
		expect(entry.reading).toBe(holyFiftyReadings['38'].LGospel)
		expect(entry.reference).not.toBe(fixedEntryFor(date).reference)
		expect(resolveDailyVerse(date)?.reference).toBe(entry.reference)
	})

	it('has no verse in Holy Week, whose readings are not served yet', () => {
		for (let offset = -6; offset <= -1; offset++) {
			expect(resolveDailyVerse(new Date(2026, 3, 12 + offset))).toBeNull()
		}
	})

	it('resolves a verse for every day outside Holy Week across two decades', () => {
		const missing: string[] = []
		for (let d = new Date(2020, 0, 1); d < new Date(2041, 0, 1); d.setDate(d.getDate() + 1)) {
			if (getReadingCycle(d).cycle === 'holyWeek') continue
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

describe('featured verse data', () => {
	const cycles = { sunday: sundayReadings, moveable: holyFiftyReadings } as const
	const entries = [
		...Object.entries(featuredVerses.sunday).map(([key, e]) => ['sunday', key, e] as const),
		...Object.entries(featuredVerses.moveable)
			.filter(([key]) => Number(key) >= 0)
			.map(([key, e]) => ['moveable', key, e] as const),
	]

	it('covers every Sunday and Holy Fifty reading set', () => {
		expect(Object.keys(featuredVerses.sunday).sort()).toEqual(Object.keys(sundayReadings).sort())
		for (const key of Object.keys(holyFiftyReadings))
			expect(featuredVerses.moveable).toHaveProperty(key)
	})

	it.each(entries)('%s %s quotes a verse of the reading it names', (cycle, key, entry) => {
		const set = (cycles[cycle] as Record<string, Record<string, string>>)[key]
		expect(set?.[entry.slot]).toBe(entry.reading)

		const verse = getReading(entry.reference)
		const verses = (getReading(entry.reading)?.chapters ?? []).flatMap((c) =>
			c.verses.map((v) => `${c.chapterNum}:${v.num}`),
		)
		const chapter = verse?.chapters[0]
		expect(verses).toContain(`${chapter?.chapterNum}:${chapter?.verses[0]?.num}`)
		expect(verse?.chapters[0]?.verses).toHaveLength(1)
	})
})
