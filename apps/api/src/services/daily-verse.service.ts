import {
	getLiturgicalName,
	getLiturgicalSeasonForDate,
	getReadingCycle,
	gregorianToCoptic,
	localizeCopticDate,
} from '@coptic/core'
import dayReadings from '../resources/dayReadings.json'
import featuredVerses from '../resources/featuredVerses.json'
import type { DailyVerse } from '../schemas'
import type { BibleTranslation } from '../types'
import { warmTranslation } from './bible/data'
import { getReading } from './bible/passages'

type FeaturedEntry = { slot: string; reference: string; reading: string }
type FeaturedFile = {
	/** Annual readings, by lectionary reading id */
	fixed: Record<string, FeaturedEntry>
	/** Jonah's Fast, Great Lent and the Holy Fifty, by days from Easter */
	moveable: Record<string, FeaturedEntry>
	/** Sundays outside those seasons, by "month:sunday" */
	sunday: Record<string, FeaturedEntry>
}

const featured = featuredVerses as FeaturedFile

/**
 * The featured verse of the readings served on a date, following the same cycle as
 * the readings. Holy Week has none: its readings follow the Pascha hours, which the
 * lectionary does not serve yet.
 */
const findFeaturedEntry = (date: Date): FeaturedEntry | null => {
	const cycle = getReadingCycle(date)
	switch (cycle.cycle) {
		case 'holyWeek':
			return null
		case 'annual': {
			const readingId = dayReadings[cycle.month - 1]?.readings[cycle.day - 1]
			return readingId === undefined ? null : (featured.fixed[String(readingId)] ?? null)
		}
		case 'sunday':
			return featured.sunday[`${cycle.month}:${cycle.sunday}`] ?? null
		default:
			return featured.moveable[String(cycle.daysFromEaster)] ?? null
	}
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
