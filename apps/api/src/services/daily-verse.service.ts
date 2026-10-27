import {
	type CopticDate,
	MS_PER_DAY,
	getEasterDate,
	getLiturgicalName,
	getLiturgicalSeasonForDate,
	gregorianToCoptic,
	localizeCopticDate,
	toMidnight,
} from '@coptic/core'
import { getReading, warmTranslation } from '../models/readings'
import dayReadings from '../resources/dayReadings.json'
import featuredVerses from '../resources/featuredVerses.json'
import type { BibleTranslation } from '../types'

type FeaturedEntry = { slot: string; reference: string; reading: string }
type FeaturedFile = {
	fixed: Record<string, FeaturedEntry>
	moveable: Record<string, FeaturedEntry>
}

const featured = featuredVerses as FeaturedFile

export type DailyVerse = {
	verse: { book: string; chapter: number; verse: number; text: string }
	/** The featured verse as a citation, e.g. "John 16:33". */
	reference: string
	/** Which reading slot the verse came from, e.g. "LGospel". */
	readingSlot: string
	/** The full reading the verse was chosen from, e.g. "John 16:20-33". */
	readingReference: string
	/** Language the verse text is actually in. */
	language: BibleTranslation
	/** Present when the requested translation had no text and English was used instead. */
	requestedLanguage?: BibleTranslation
	fallback?: boolean
	season?: string
	seasonKey?: string
	fullDate: CopticDate
}

const getDaysFromEaster = (date: Date): number => {
	const easter = getEasterDate(date.getFullYear())
	return Math.round((toMidnight(date) - toMidnight(easter)) / MS_PER_DAY)
}

/**
 * Resolve the featured verse entry for a date: moveable (Lent/Jonah) wins, then
 * the fixed lectionary id. Mirrors the precedence in the readings model.
 */
const findFeaturedEntry = (date: Date): FeaturedEntry | null => {
	const moveable = featured.moveable[String(getDaysFromEaster(date))]
	if (moveable) return moveable

	const coptic = gregorianToCoptic(date)
	const readingId = dayReadings[coptic.month - 1]?.readings[coptic.day - 1]
	if (readingId === undefined) return null
	return featured.fixed[String(readingId)] ?? null
}

/**
 * Resolve the verse text for a citation in the requested translation. A missing
 * translation falls back to English — explicitly labelled, never silent.
 */
const resolveText = (
	reference: string,
	translation: BibleTranslation,
): {
	language: BibleTranslation
	fallback: boolean
	text: string
	book: string
	chapter: number
	verse: number
} | null => {
	const resolve = (lang: BibleTranslation) => {
		const reading = getReading(reference, lang)
		const chapter = reading?.chapters[0]
		const verse = chapter?.verses[0]
		if (!reading || !chapter || !verse) return null
		return {
			language: lang,
			text: verse.text,
			book: reading.bookName,
			chapter: chapter.chapterNum,
			verse: verse.num,
		}
	}

	const primary = resolve(translation)
	if (primary) return { ...primary, fallback: false }
	if (translation !== 'en') {
		const english = resolve('en')
		if (english) return { ...english, fallback: true }
	}
	return null
}

export const resolveDailyVerse = (
	date: Date,
	translation: BibleTranslation = 'en',
): DailyVerse | null => {
	const entry = findFeaturedEntry(date)
	if (!entry) return null

	const resolved = resolveText(entry.reference, translation)
	if (!resolved) return null

	const season = getLiturgicalSeasonForDate(date)

	return {
		verse: {
			book: resolved.book,
			chapter: resolved.chapter,
			verse: resolved.verse,
			text: resolved.text,
		},
		reference: entry.reference,
		readingSlot: entry.slot,
		readingReference: entry.reading,
		language: resolved.language,
		...(resolved.fallback ? { fallback: true, requestedLanguage: translation } : {}),
		...(season
			? { season: getLiturgicalName(season.name, translation), seasonKey: season.name }
			: {}),
		fullDate: localizeCopticDate(gregorianToCoptic(date), translation),
	}
}

/**
 * Entry point for REST and GraphQL. In Workers, bible data is lazy-loaded from R2
 * on first use per isolate, so warm the requested translation and English (the
 * fallback) before resolving.
 */
export const getDailyVerse = async (
	date: Date,
	translation: BibleTranslation = 'en',
): Promise<DailyVerse | null> => {
	await warmTranslation(translation)
	if (translation !== 'en') await warmTranslation('en')
	return resolveDailyVerse(date, translation)
}
